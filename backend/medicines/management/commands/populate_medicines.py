"""
Management command to populate the database with pre-filled medicines.
"""
import json
import os
from django.core.management.base import BaseCommand
from medicines.models import Medicine


class Command(BaseCommand):
    help = 'Populate the database with pre-filled medicines from JSON file'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing medicines before populating',
        )

    def handle(self, *args, **options):
        # Path to the JSON file
        json_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            'data',
            'medicines_database.json'
        )

        if not os.path.exists(json_path):
            self.stdout.write(
                self.style.ERROR(f'JSON file not found: {json_path}')
            )
            return

        # Load medicines from JSON
        with open(json_path, 'r', encoding='utf-8') as f:
            medicines_data = json.load(f)

        self.stdout.write(f'Found {len(medicines_data)} medicines in JSON file')

        if options['clear']:
            deleted_count, _ = Medicine.objects.all().delete()
            self.stdout.write(
                self.style.WARNING(f'Deleted {deleted_count} existing medicines')
            )

        created_count = 0
        updated_count = 0
        skipped_count = 0

        # Dosage options for each form
        dosage_options = {
            'comprimé': ['500mg', '1000mg', '250mg', '100mg', '200mg', '400mg', '50mg', '10mg', '20mg', '5mg'],
            'gélule': ['250mg', '500mg', '100mg', '200mg'],
            'sirop': ['125mg/5ml', '250mg/5ml', '100mg/5ml'],
            'injectable': ['1g', '500mg', '250mg', '1ml', '2ml', '5ml', '10ml'],
            'crème': ['1%', '2%', '0.5%'],
            'pommade': ['1%', '2%', '0.5%'],
            'solution': ['0.5%', '1%', '10ml', '20ml'],
            'suppositoire': ['500mg', '250mg', '100mg'],
            'inhalateur': ['100µg', '200µg'],
            'collyre': ['0.5%', '1%', '5ml', '10ml'],
        }

        # Forms for different categories
        category_forms = {
            'analgesique': ['comprimé', 'gélule', 'sirop', 'injectable', 'suppositoire'],
            'antibiotique': ['comprimé', 'gélule', 'sirop', 'injectable'],
            'antipaludeen': ['comprimé', 'injectable', 'sirop'],
            'antiviral': ['comprimé', 'gélule', 'crème'],
            'anti_inflammatoire': ['comprimé', 'gélule', 'injectable', 'crème', 'pommade'],
            'antihistaminique': ['comprimé', 'sirop'],
            'antidiabetique': ['comprimé', 'injectable'],
            'antihypertenseur': ['comprimé'],
            'cardiovasculaire': ['comprimé', 'injectable'],
            'digestif': ['comprimé', 'gélule', 'sirop'],
            'respiratoire': ['inhalateur', 'sirop', 'comprimé'],
            'dermatologique': ['crème', 'pommade', 'solution'],
            'ophtalmologique': ['collyre', 'pommade'],
            'vitamine': ['comprimé', 'gélule', 'sirop', 'injectable'],
            'contraceptif': ['comprimé', 'injectable'],
            'antiparasitaire': ['comprimé', 'sirop'],
            'psychotrope': ['comprimé', 'injectable'],
            'autre': ['comprimé', 'gélule'],
        }

        for med_data in medicines_data:
            name = med_data['name']
            category = med_data.get('category', 'autre')
            
            # Get forms for this category
            forms = category_forms.get(category, ['comprimé', 'gélule'])
            
            # Create multiple entries with different dosages and forms
            for form in forms[:2]:  # Limit to 2 forms per medicine
                dosages = dosage_options.get(form, ['100mg'])
                
                for dosage in dosages[:2]:  # Limit to 2 dosages per form
                    try:
                        medicine, created = Medicine.objects.update_or_create(
                            name=name,
                            dosage=dosage,
                            form=form,
                            defaults={
                                'description': med_data.get('description', ''),
                                'category': category,
                                'indications': med_data.get('indications', ''),
                                'contraindications': med_data.get('contraindications', ''),
                                'posology': med_data.get('posology', ''),
                                'side_effects': med_data.get('side_effects', ''),
                                'requires_prescription': med_data.get('requires_prescription', True),
                            }
                        )
                        
                        if created:
                            created_count += 1
                        else:
                            updated_count += 1
                            
                    except Exception as e:
                        self.stdout.write(
                            self.style.WARNING(
                                f'Skipped {name} {dosage} {form}: {str(e)}'
                            )
                        )
                        skipped_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'\nPopulation complete!\n'
                f'  Created: {created_count}\n'
                f'  Updated: {updated_count}\n'
                f'  Skipped: {skipped_count}'
            )
        )
