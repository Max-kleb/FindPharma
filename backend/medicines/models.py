from django.db import models

class Medicine (models.Model):
    #Medicament
    name = models.CharField(max_length=255, db_index=True)
    description = models.TextField(blank=True, null=True)
    dosage = models.CharField(max_length=100, blank=True, null=True)  # Ex: "1000mg"
    form = models.CharField(max_length=100, blank=True, null=True)  # Ex: "Comprimé"
    average_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    requires_prescription = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
  
    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} {self.dosage or ''}".strip()