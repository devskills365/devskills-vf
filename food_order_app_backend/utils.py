# utils.py
import socket

def get_local_ip():
    """Tente de se connecter à une adresse externe pour trouver l'IP locale."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # L'adresse IP à laquelle vous vous connectez n'a pas besoin d'exister,
        # elle sert juste à déterminer l'interface réseau active.
        s.connect(('192.168.1.1', 1)) 
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1' 
    finally:
        s.close()
    return IP