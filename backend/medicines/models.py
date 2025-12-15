from django.db import models

class Medicine(models.Model):
    """
    Modèle complet pour les médicaments avec documentation détaillée
    """
    
    # Catégories de médicaments
    CATEGORY_CHOICES = [
        ('analgesique', 'Analgésique / Antidouleur'),
        ('antibiotique', 'Antibiotique'),
        ('antipaludeen', 'Antipaludéen'),
        ('antiviral', 'Antiviral'),
        ('anti_inflammatoire', 'Anti-inflammatoire'),
        ('antihistaminique', 'Antihistaminique'),
        ('antidiabetique', 'Antidiabétique'),
        ('antihypertenseur', 'Antihypertenseur'),
        ('cardiovasculaire', 'Cardiovasculaire'),
        ('digestif', 'Système digestif'),
        ('respiratoire', 'Système respiratoire'),
        ('dermatologique', 'Dermatologique'),
        ('ophtalmologique', 'Ophtalmologique'),
        ('vitamine', 'Vitamines et suppléments'),
        ('contraceptif', 'Contraceptif'),
        ('antiparasitaire', 'Antiparasitaire'),
        ('psychotrope', 'Psychotrope'),
        ('autre', 'Autre'),
    ]
    
    # Informations de base
    name = models.CharField(max_length=255, db_index=True, verbose_name="Nom")
    description = models.TextField(blank=True, null=True, verbose_name="Description")
    dosage = models.CharField(max_length=100, blank=True, null=True, verbose_name="Dosage")
    form = models.CharField(max_length=100, blank=True, null=True, verbose_name="Forme")
    average_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name="Prix moyen")
    requires_prescription = models.BooleanField(default=False, verbose_name="Ordonnance requise")
    
    # Documentation médicale complète
    category = models.CharField(
        max_length=50, 
        choices=CATEGORY_CHOICES, 
        default='autre',
        verbose_name="Catégorie"
    )
    indications = models.TextField(
        blank=True, 
        null=True,
        verbose_name="Indications",
        help_text="À quoi sert ce médicament"
    )
    contraindications = models.TextField(
        blank=True, 
        null=True,
        verbose_name="Contre-indications",
        help_text="Cas où le médicament ne doit pas être utilisé"
    )
    posology = models.TextField(
        blank=True, 
        null=True,
        verbose_name="Posologie",
        help_text="Dosage recommandé et fréquence de prise"
    )
    side_effects = models.TextField(
        blank=True, 
        null=True,
        verbose_name="Effets secondaires",
        help_text="Effets indésirables possibles"
    )
    
    # Image et source
    image_url = models.URLField(
        blank=True, 
        null=True,
        verbose_name="URL de l'image"
    )
    wikipedia_url = models.URLField(
        blank=True, 
        null=True,
        verbose_name="Source Wikipedia"
    )
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
  
    class Meta:
        ordering = ['name']
        verbose_name = "Médicament"
        verbose_name_plural = "Médicaments"
        unique_together = ['name', 'dosage', 'form']
        constraints = [
            models.UniqueConstraint(
                fields=['name', 'dosage', 'form'],
                name='unique_medicine_combination'
            )
        ]

    def __str__(self):
        return f"{self.name} {self.dosage or ''}".strip()
    
    def get_category_display_fr(self):
        """Retourne le nom de la catégorie en français"""
        return dict(self.CATEGORY_CHOICES).get(self.category, 'Autre')