from django.db import models
from pharmacies.models import Pharmacy
from medicines.models import Medicine

class Stock(models.Model):
    pharmacy = models.ForeignKey(Pharmacy, on_delete=models.CASCADE, related_name='stocks')
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE,  related_name='stocks')

    quantity = models.IntegerField(default=0, )
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_available = models.BooleanField(default=True)
    last_updated = models.DateTimeField(auto_now=True)


    class Meta:
        unique_together = ['pharmacy', 'medicine']
        ordering = ['-last_updated']


    def __str__(self):
        return f"{self.medicine.name} @ {self.pharmacy.name} ({self.quantity})"
    