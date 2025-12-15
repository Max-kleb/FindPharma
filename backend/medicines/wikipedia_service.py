"""
Service pour récupérer les informations des médicaments depuis Wikipedia
Utilise urllib (bibliothèque standard) pour éviter les dépendances externes
"""

import urllib.request
import urllib.parse
import json
import re
from typing import Optional, Dict, Any


class WikipediaService:
    """
    Service pour récupérer les informations des médicaments depuis Wikipedia (français)
    """
    
    BASE_URL = "https://fr.wikipedia.org/api/rest_v1"
    SEARCH_URL = "https://fr.wikipedia.org/w/api.php"
    
    @classmethod
    def search_medicine(cls, name: str) -> Optional[Dict[str, Any]]:
        """
        Recherche un médicament sur Wikipedia et retourne ses informations
        """
        try:
            # Étape 1: Rechercher la page
            page_title = cls._search_page(name)
            if not page_title:
                return None
            
            # Étape 2: Récupérer le contenu de la page
            content = cls._get_page_content(page_title)
            if not content:
                return None
            
            # Étape 3: Extraire les informations pertinentes
            info = cls._extract_medicine_info(content, page_title)
            
            return info
            
        except Exception as e:
            print(f"Erreur Wikipedia: {e}")
            return None
    
    @classmethod
    def _make_request(cls, url: str) -> Optional[Dict[str, Any]]:
        """
        Effectue une requête HTTP et retourne le JSON
        """
        try:
            req = urllib.request.Request(
                url,
                headers={'User-Agent': 'FindPharma/1.0 (Educational Project)'}
            )
            with urllib.request.urlopen(req, timeout=10) as response:
                return json.loads(response.read().decode('utf-8'))
        except Exception as e:
            print(f"Erreur requête: {e}")
            return None
    
    @classmethod
    def _search_page(cls, query: str) -> Optional[str]:
        """
        Recherche une page Wikipedia correspondant au médicament
        """
        params = urllib.parse.urlencode({
            'action': 'query',
            'list': 'search',
            'srsearch': f"{query} médicament",
            'format': 'json',
            'srlimit': '5'
        })
        
        url = f"{cls.SEARCH_URL}?{params}"
        data = cls._make_request(url)
        
        if data and data.get('query', {}).get('search'):
            # Prendre le premier résultat pertinent
            for result in data['query']['search']:
                title = result['title'].lower()
                query_lower = query.lower()
                # Vérifier que le titre contient le nom du médicament
                if query_lower in title or title in query_lower:
                    return result['title']
            # Sinon prendre le premier résultat
            return data['query']['search'][0]['title']
        return None
    
    @classmethod
    def _get_page_content(cls, title: str) -> Optional[Dict[str, Any]]:
        """
        Récupère le contenu d'une page Wikipedia
        """
        encoded_title = urllib.parse.quote(title.replace(' ', '_'))
        summary_url = f"{cls.BASE_URL}/page/summary/{encoded_title}"
        return cls._make_request(summary_url)
    
    @classmethod
    def _extract_medicine_info(cls, content: Dict[str, Any], title: str) -> Dict[str, Any]:
        """
        Extrait les informations pertinentes du contenu Wikipedia
        """
        extract = content.get('extract', '')
        
        # Nettoyer et formater la description
        description = cls._clean_text(extract)
        
        # Essayer d'extraire des indications du texte
        indications = cls._extract_indications(description)
        
        # Essayer d'extraire la posologie
        posology = cls._extract_posology(description)
        
        # Essayer d'extraire les contre-indications
        contraindications = cls._extract_contraindications(description)
        
        # Essayer d'extraire les effets secondaires
        side_effects = cls._extract_side_effects(description)
        
        # Image
        image_url = None
        if content.get('thumbnail'):
            image_url = content['thumbnail'].get('source')
        elif content.get('originalimage'):
            image_url = content['originalimage'].get('source')
        
        # URL Wikipedia
        wikipedia_url = content.get('content_urls', {}).get('desktop', {}).get('page', '')
        if not wikipedia_url:
            encoded_title = urllib.parse.quote(title.replace(' ', '_'))
            wikipedia_url = f"https://fr.wikipedia.org/wiki/{encoded_title}"
        
        return {
            'name': title,
            'description': description[:500] if description else '',
            'indications': indications or 'Consulter la notice ou votre médecin.',
            'posology': posology or 'Consulter la notice ou votre médecin.',
            'contraindications': contraindications or 'Consulter la notice ou votre médecin.',
            'side_effects': side_effects or 'Consulter la notice ou votre médecin.',
            'wikipedia_url': wikipedia_url,
            'image_url': image_url,
            'found': True
        }
    
    @classmethod
    def _clean_text(cls, text: str) -> str:
        """
        Nettoie le texte en supprimant les références et caractères spéciaux
        """
        if not text:
            return ''
        
        # Supprimer les références [1], [2], etc.
        text = re.sub(r'\[\d+\]', '', text)
        
        # Supprimer les espaces multiples
        text = re.sub(r'\s+', ' ', text)
        
        # Supprimer les espaces en début et fin
        text = text.strip()
        
        return text
    
    @classmethod
    def _extract_indications(cls, description: str) -> str:
        """
        Tente d'extraire les indications thérapeutiques de la description
        """
        if not description:
            return ''
        
        desc_lower = description.lower()
        
        # Dictionnaire des propriétés médicinales avec leurs indications
        medicine_properties = {
            'antalgique': 'Soulagement de la douleur',
            'anti-douleur': 'Soulagement de la douleur',
            'antipyrétique': 'Réduction de la fièvre',
            'anti-fièvre': 'Réduction de la fièvre',
            'anti-inflammatoire': 'Réduction de l\'inflammation',
            'antibiotique': 'Traitement des infections bactériennes',
            'antifongique': 'Traitement des infections fongiques',
            'antiviral': 'Traitement des infections virales',
            'antipaludéen': 'Traitement et prévention du paludisme',
            'antipaludique': 'Traitement et prévention du paludisme',
            'antiagr': 'Prévention de la formation de caillots sanguins',
            'antihypertens': 'Régulation de la tension artérielle',
            'antidiabét': 'Régulation de la glycémie',
            'anxiolytique': 'Réduction de l\'anxiété',
            'antidépresseur': 'Traitement de la dépression',
            'antiémétique': 'Prévention des nausées et vomissements',
            'antihistaminique': 'Traitement des allergies',
            'bronchodilat': 'Amélioration de la respiration',
            'diurétique': 'Élimination de l\'excès d\'eau',
        }
        
        indications_found = []
        
        # Chercher les propriétés médicinales connues
        for prop, indication in medicine_properties.items():
            if prop in desc_lower and indication not in indications_found:
                indications_found.append(indication)
        
        # Chercher les utilisations spécifiques dans le texte
        usage_keywords = [
            'utilisé pour', 'utilisée pour', 'utilisé comme', 'utilisée comme',
            'indiqué pour', 'indiquée pour', 'traitement de', 'traitement du',
            'soulager', 'prévention de', 'contre'
        ]
        
        for keyword in usage_keywords:
            if keyword in desc_lower:
                start_idx = desc_lower.find(keyword)
                end_idx = description.find('.', start_idx)
                if end_idx != -1:
                    usage_text = description[start_idx:end_idx + 1].strip()
                    if len(usage_text) > 15 and len(usage_text) < 200:
                        # Nettoyer et capitaliser
                        usage_text = usage_text[0].upper() + usage_text[1:]
                        # Vérifier que cette indication n'est pas déjà présente (même partiellement)
                        is_duplicate = any(
                            usage_text.lower() in existing.lower() or 
                            existing.lower() in usage_text.lower()
                            for existing in indications_found
                        )
                        if not is_duplicate:
                            indications_found.append(usage_text)
        
        if indications_found:
            # Limiter à 3 indications maximum, séparées par des points
            result = '. '.join(indications_found[:3])
            # Nettoyer les doubles points
            result = result.replace('..', '.').strip()
            if not result.endswith('.'):
                result += '.'
            return result
        
        return ''
    
    @classmethod
    def _extract_posology(cls, description: str) -> str:
        """
        Tente d'extraire la posologie de la description
        """
        keywords = ['dose', 'dosage', 'posologie', 'mg', 'gramme', 'comprimé', 'prise']
        
        for keyword in keywords:
            if keyword in description.lower():
                start_idx = max(0, description.lower().find(keyword) - 50)
                end_idx = description.find('.', start_idx + 50)
                if end_idx != -1 and end_idx > start_idx:
                    return description[start_idx:end_idx + 1].strip()
        
        return ''
    
    @classmethod
    def _extract_contraindications(cls, description: str) -> str:
        """
        Tente d'extraire les contre-indications de la description
        """
        keywords = ['contre-indiqué', 'déconseillé', 'éviter', 'ne pas utiliser', 'allergie', 'hypersensibilité']
        
        for keyword in keywords:
            if keyword in description.lower():
                start_idx = max(0, description.lower().find(keyword) - 20)
                end_idx = description.find('.', start_idx + 20)
                if end_idx != -1 and end_idx > start_idx:
                    return description[start_idx:end_idx + 1].strip()
        
        return ''
    
    @classmethod
    def _extract_side_effects(cls, description: str) -> str:
        """
        Tente d'extraire les effets secondaires de la description
        """
        keywords = ['effet secondaire', 'effets indésirables', 'peut causer', 'peut provoquer', 'risque de']
        
        for keyword in keywords:
            if keyword in description.lower():
                start_idx = max(0, description.lower().find(keyword) - 20)
                end_idx = description.find('.', start_idx + 20)
                if end_idx != -1 and end_idx > start_idx:
                    return description[start_idx:end_idx + 1].strip()
        
        return ''


def get_medicine_info_from_wikipedia(medicine_name: str) -> Dict[str, Any]:
    """
    Fonction utilitaire pour récupérer les informations d'un médicament
    """
    result = WikipediaService.search_medicine(medicine_name)
    
    if result:
        return result
    
    return {
        'found': False,
        'name': medicine_name,
        'description': '',
        'indications': '',
        'wikipedia_url': '',
        'image_url': None
    }
