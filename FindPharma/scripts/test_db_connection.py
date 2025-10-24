import psycopg2

try:
    conn = psycopg2.connect(
        dbname="findpharma",
        user="postgres",
        password="password",
        host="localhost",
        port="5432"
    )
    cur = conn.cursor()
    
    # Vérifier PostGIS
    cur.execute("SELECT PostGIS_version();")
    version = cur.fetchone()
    print(f"✅ Connexion réussie !")
    print(f"✅ PostGIS version : {version[0]}")
    
    cur.close()
    conn.close()
    
except Exception as e:
    print(f"❌ Erreur de connexion : {e}")