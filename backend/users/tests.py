from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, SearchHistory


class UserRegistrationTestCase(APITestCase):
    """Tests pour l'inscription des utilisateurs"""
    
    def setUp(self):
        self.register_url = reverse('users:register')
        self.valid_user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'TestPass123!',
            'password2': 'TestPass123!',
            'user_type': 'customer',
            'phone': '0600000000'
        }
    
    def test_user_registration_success(self):
        """Test inscription utilisateur valide"""
        response = self.client.post(self.register_url, self.valid_user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('user', response.data)
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data['tokens'])
        self.assertIn('refresh', response.data['tokens'])
        self.assertEqual(response.data['user']['username'], 'testuser')
        self.assertEqual(response.data['user']['email'], 'test@example.com')
        self.assertEqual(response.data['user']['user_type'], 'customer')
        
        # Vérifier que l'utilisateur est créé en base
        self.assertTrue(User.objects.filter(username='testuser').exists())
    
    def test_user_registration_password_mismatch(self):
        """Test inscription avec mots de passe non concordants"""
        invalid_data = self.valid_user_data.copy()
        invalid_data['password2'] = 'DifferentPass123!'
        response = self.client.post(self.register_url, invalid_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data)
    
    def test_user_registration_duplicate_username(self):
        """Test inscription avec username déjà utilisé"""
        # Créer un premier utilisateur
        User.objects.create_user(username='testuser', email='first@example.com', password='Pass123!')
        
        # Tenter de créer un second avec le même username
        response = self.client.post(self.register_url, self.valid_user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('username', response.data)
    
    def test_user_registration_duplicate_email(self):
        """Test inscription avec email déjà utilisé"""
        # Créer un premier utilisateur
        User.objects.create_user(username='user1', email='test@example.com', password='Pass123!')
        
        # Tenter de créer un second avec le même email
        invalid_data = self.valid_user_data.copy()
        invalid_data['username'] = 'differentuser'
        response = self.client.post(self.register_url, invalid_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)
    
    def test_user_registration_weak_password(self):
        """Test inscription avec mot de passe trop faible"""
        invalid_data = self.valid_user_data.copy()
        invalid_data['password'] = 'weak'
        invalid_data['password2'] = 'weak'
        response = self.client.post(self.register_url, invalid_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class UserLoginTestCase(APITestCase):
    """Tests pour la connexion des utilisateurs"""
    
    def setUp(self):
        self.login_url = reverse('users:login')
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPass123!',
            user_type='customer'
        )
    
    def test_user_login_success(self):
        """Test connexion avec identifiants valides"""
        response = self.client.post(self.login_url, {
            'username': 'testuser',
            'password': 'TestPass123!'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('user', response.data)
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data['tokens'])
        self.assertIn('refresh', response.data['tokens'])
    
    def test_user_login_invalid_credentials(self):
        """Test connexion avec mot de passe incorrect"""
        response = self.client.post(self.login_url, {
            'username': 'testuser',
            'password': 'WrongPassword123!'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_user_login_nonexistent_user(self):
        """Test connexion avec utilisateur inexistant"""
        response = self.client.post(self.login_url, {
            'username': 'nonexistent',
            'password': 'TestPass123!'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class UserLogoutTestCase(APITestCase):
    """Tests pour la déconnexion des utilisateurs"""
    
    def setUp(self):
        self.logout_url = reverse('users:logout')
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPass123!',
            user_type='customer'
        )
        self.refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.refresh.access_token}')
    
    def test_user_logout_success(self):
        """Test déconnexion réussie"""
        response = self.client.post(self.logout_url, {
            'refresh': str(self.refresh)
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
    
    def test_user_logout_without_token(self):
        """Test déconnexion sans token"""
        self.client.credentials()  # Supprimer les credentials
        response = self.client.post(self.logout_url, {
            'refresh': str(self.refresh)
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class TokenRefreshTestCase(APITestCase):
    """Tests pour le rafraîchissement de token"""
    
    def setUp(self):
        self.refresh_url = reverse('users:token_refresh')
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPass123!',
            user_type='customer'
        )
        self.refresh = RefreshToken.for_user(self.user)
    
    def test_token_refresh_success(self):
        """Test rafraîchissement de token réussi"""
        response = self.client.post(self.refresh_url, {
            'refresh': str(self.refresh)
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)  # Rotation activée
    
    def test_token_refresh_invalid_token(self):
        """Test rafraîchissement avec token invalide"""
        response = self.client.post(self.refresh_url, {
            'refresh': 'invalid_token'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class UserProfileTestCase(APITestCase):
    """Tests pour l'accès au profil utilisateur"""
    
    def setUp(self):
        self.profile_url = reverse('users:profile')
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPass123!',
            user_type='customer',
            phone='0600000000'
        )
        self.refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.refresh.access_token}')
    
    def test_get_profile_authenticated(self):
        """Test récupération du profil avec authentification"""
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')
        self.assertEqual(response.data['email'], 'test@example.com')
        self.assertEqual(response.data['user_type'], 'customer')
        self.assertEqual(response.data['phone'], '0600000000')
    
    def test_get_profile_unauthenticated(self):
        """Test récupération du profil sans authentification"""
        self.client.credentials()  # Supprimer les credentials
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class UpdateProfileTestCase(APITestCase):
    """Tests pour la mise à jour du profil utilisateur"""
    
    def setUp(self):
        self.update_profile_url = reverse('users:profile-update')
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPass123!',
            user_type='customer'
        )
        self.refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.refresh.access_token}')
    
    def test_update_profile_success(self):
        """Test mise à jour du profil réussie"""
        response = self.client.patch(self.update_profile_url, {
            'first_name': 'John',
            'last_name': 'Doe',
            'phone': '0611111111'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['first_name'], 'John')
        self.assertEqual(response.data['user']['last_name'], 'Doe')
        self.assertEqual(response.data['user']['phone'], '0611111111')
        
        # Vérifier en base
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, 'John')
        self.assertEqual(self.user.last_name, 'Doe')
        self.assertEqual(self.user.phone, '0611111111')
    
    def test_update_profile_unauthenticated(self):
        """Test mise à jour du profil sans authentification"""
        self.client.credentials()
        response = self.client.patch(self.update_profile_url, {
            'first_name': 'John'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ChangePasswordTestCase(APITestCase):
    """Tests pour le changement de mot de passe"""
    
    def setUp(self):
        self.change_password_url = reverse('users:password-change')
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='OldPass123!',
            user_type='customer'
        )
        self.refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.refresh.access_token}')
    
    def test_change_password_success(self):
        """Test changement de mot de passe réussi"""
        response = self.client.post(self.change_password_url, {
            'old_password': 'OldPass123!',
            'new_password': 'NewPass123!',
            'new_password2': 'NewPass123!'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Vérifier que le nouveau mot de passe fonctionne
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('NewPass123!'))
    
    def test_change_password_wrong_old_password(self):
        """Test changement de mot de passe avec ancien mot de passe incorrect"""
        response = self.client.post(self.change_password_url, {
            'old_password': 'WrongOldPass123!',
            'new_password': 'NewPass123!',
            'new_password2': 'NewPass123!'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_change_password_mismatch(self):
        """Test changement de mot de passe avec confirmation non concordante"""
        response = self.client.post(self.change_password_url, {
            'old_password': 'OldPass123!',
            'new_password': 'NewPass123!',
            'new_password2': 'DifferentPass123!'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class SearchHistoryTestCase(TestCase):
    """Tests pour le modèle SearchHistory"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPass123!',
            user_type='customer'
        )
    
    def test_create_search_history(self):
        """Test création d'un historique de recherche"""
        search = SearchHistory.objects.create(
            user=self.user,
            query='Doliprane',
            search_type='medicine',
            results_count=5
        )
        self.assertEqual(search.user, self.user)
        self.assertEqual(search.query, 'Doliprane')
        self.assertEqual(search.search_type, 'medicine')
        self.assertEqual(search.results_count, 5)
        self.assertIsNotNone(search.created_at)
    
    def test_search_history_ordering(self):
        """Test ordre chronologique inverse des recherches"""
        search1 = SearchHistory.objects.create(
            user=self.user,
            query='Doliprane',
            search_type='medicine'
        )
        search2 = SearchHistory.objects.create(
            user=self.user,
            query='Pharmacie',
            search_type='nearby'
        )
        
        searches = SearchHistory.objects.all()
        # Le plus récent devrait être en premier
        self.assertEqual(searches[0], search2)
        self.assertEqual(searches[1], search1)
    
    def test_search_history_user_relation(self):
        """Test relation avec l'utilisateur"""
        SearchHistory.objects.create(
            user=self.user,
            query='Doliprane',
            search_type='medicine'
        )
        SearchHistory.objects.create(
            user=self.user,
            query='Pharmacie',
            search_type='nearby'
        )
        
        self.assertEqual(self.user.search_history.count(), 2)
    
    def test_search_history_cascade_delete(self):
        """Test suppression en cascade lors de la suppression de l'utilisateur"""
        SearchHistory.objects.create(
            user=self.user,
            query='Doliprane',
            search_type='medicine'
        )
        
        user_id = self.user.id
        self.user.delete()
        
        # Les recherches de l'utilisateur devraient être supprimées
        self.assertEqual(SearchHistory.objects.filter(user_id=user_id).count(), 0)
