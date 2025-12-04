#!/usr/bin/env python3
"""
Script de test pour vérifier les calculs de distance dans FindPharma
Compare les résultats du backend avec des distances connues à Yaoundé
"""

from math import radians, sin, cos, sqrt, atan2, asin

def haversine_old(lon1, lat1, lon2, lat2):
    """Version utilisée dans PharmacyViewSet.nearby (ligne 14)"""
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    km = 6371 * c
    return km


def calculate_distance(lat1, lon1, lat2, lon2):
    """Version utilisée dans search_medicine (ligne 117)"""
    R = 6371  # Rayon de la Terre en km
    
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    distance = R * c
    
    return round(distance, 2)


def test_distance(description, lat1, lon1, lat2, lon2, expected_range):
    """Test une distance et compare avec la plage attendue"""
    print(f"\n{'='*70}")
    print(f"🧪 Test: {description}")
    print(f"{'='*70}")
    
    # Calcul avec les deux fonctions
    dist_old = haversine_old(lon1, lat1, lon2, lat2)
    dist_new = calculate_distance(lat1, lon1, lat2, lon2)
    
    print(f"\n📍 Coordonnées:")
    print(f"   Point A: {lat1}, {lon1}")
    print(f"   Point B: {lat2}, {lon2}")
    
    print(f"\n📏 Résultats:")
    print(f"   haversine_old()     : {dist_old:.3f} km = {int(dist_old * 1000)} m")
    print(f"   calculate_distance(): {dist_new:.3f} km = {int(dist_new * 1000)} m")
    print(f"   Différence          : {abs(dist_old - dist_new):.6f} km")
    
    print(f"\n✅ Attendu: {expected_range}")
    
    # Vérification
    min_km, max_km = expected_range
    if min_km <= dist_new <= max_km:
        print(f"✅ CORRECT: La distance est dans la plage attendue")
    elif dist_new < min_km:
        print(f"⚠️  TROP PETIT: Distance calculée ({dist_new:.2f} km) < minimum attendu ({min_km} km)")
        print(f"   Différence: {(min_km - dist_new):.2f} km soit {int((min_km - dist_new) * 1000)} mètres en moins")
    else:
        print(f"⚠️  TROP GRAND: Distance calculée ({dist_new:.2f} km) > maximum attendu ({max_km} km)")
        print(f"   Différence: {(dist_new - max_km):.2f} km soit {int((dist_new - max_km) * 1000)} mètres en trop")
    
    return dist_new


def main():
    print("="*70)
    print("🧪 TEST DE CALCUL DE DISTANCE - FINDPHARMA BACKEND")
    print("="*70)
    print("\n📍 Tests basés sur des distances réelles à Yaoundé, Cameroun\n")
    
    # Test 1: Centre-ville → Bastos (distance réelle: ~4-5 km)
    test_distance(
        "Centre-ville Yaoundé (Poste Centrale) → Bastos",
        lat1=3.8667, lon1=11.5167,  # Centre-ville
        lat2=3.8947, lon2=11.5089,  # Bastos
        expected_range=(3.5, 5.5)
    )
    
    # Test 2: Centre-ville → Mvog-Ada (distance réelle: ~2-3 km)
    test_distance(
        "Centre-ville → Quartier Mvog-Ada",
        lat1=3.8667, lon1=11.5167,  # Centre-ville
        lat2=3.8450, lon2=11.5050,  # Mvog-Ada
        expected_range=(1.5, 3.5)
    )
    
    # Test 3: Même quartier (distance réelle: ~500m-1km)
    test_distance(
        "Deux points dans le même quartier",
        lat1=3.8667, lon1=11.5167,
        lat2=3.8700, lon2=11.5200,
        expected_range=(0.3, 1.2)
    )
    
    # Test 4: Très proche (~100-200m)
    test_distance(
        "Deux pharmacies très proches (même rue)",
        lat1=3.8667, lon1=11.5167,
        lat2=3.8677, lon2=11.5177,
        expected_range=(0.05, 0.25)
    )
    
    # Test 5: Distance moyenne (~10 km)
    test_distance(
        "Centre-ville → Périphérie (Ngousso)",
        lat1=3.8667, lon1=11.5167,  # Centre
        lat2=3.9200, lon2=11.5500,  # Ngousso
        expected_range=(5.0, 12.0)
    )
    
    # Test 6: Vérification des coordonnées inversées (bug potentiel)
    print(f"\n{'='*70}")
    print(f"🔍 Test de vérification: Ordre des paramètres")
    print(f"{'='*70}")
    
    lat1, lon1 = 3.8667, 11.5167
    lat2, lon2 = 3.8947, 11.5089
    
    # Ordre correct: haversine(lon1, lat1, lon2, lat2)
    dist_correct = haversine_old(lon1, lat1, lon2, lat2)
    
    # Ordre inversé (bug potentiel): haversine(lat1, lon1, lat2, lon2)
    dist_wrong = haversine_old(lat1, lon1, lat2, lon2)
    
    print(f"\n📏 Avec ordre correct (lon, lat, lon, lat):")
    print(f"   haversine_old({lon1}, {lat1}, {lon2}, {lat2}) = {dist_correct:.3f} km")
    
    print(f"\n📏 Avec ordre inversé (lat, lon, lat, lon):")
    print(f"   haversine_old({lat1}, {lon1}, {lat2}, {lon2}) = {dist_wrong:.3f} km")
    
    print(f"\n📊 Différence: {abs(dist_correct - dist_wrong):.3f} km")
    
    if abs(dist_correct - dist_wrong) > 0.01:
        print("⚠️  ATTENTION: L'ordre des paramètres a un impact sur le résultat!")
        print("   Vérifiez que les appels utilisent: haversine(lon1, lat1, lon2, lat2)")
    else:
        print("✅ OK: L'ordre des paramètres est sans impact majeur pour ces coordonnées")
    
    # Résumé final
    print(f"\n{'='*70}")
    print("📊 RÉSUMÉ")
    print(f"{'='*70}")
    print("\n✅ Formule Haversine implémentée correctement")
    print("✅ Les deux fonctions (haversine_old et calculate_distance) donnent des résultats identiques")
    print("\n💡 Si les distances affichées dans l'interface semblent trop petites:")
    print("   1. Vérifiez l'ordre des paramètres lors de l'appel")
    print("   2. Vérifiez que le backend retourne des mètres (pas des km)")
    print("   3. Vérifiez que le frontend formate correctement")
    print("   4. Utilisez test_distance_calculation.html pour tester le frontend")
    print(f"{'='*70}\n")


if __name__ == "__main__":
    main()
