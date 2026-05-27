import sys
import os
import bcrypt

# Ensure the app directory is in the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.models.base_db import UserDB


def create_admin(username: str, password: str, email: str):
    """Create a new user and grant admin rights.

    Args:
        username: Desired username for the admin.
        password: Plain‑text password; it will be hashed with bcrypt.
        email: Unique email address for the admin.
    """
    # Hash the password securely using bcrypt
    salt = bcrypt.gensalt()
    password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    db = UserDB()
    # Check if the user already exists
    existing = db.get_by_email(email) or db.get_by_username(username)
    if existing:
        print(f"⚠️ User already exists (id={existing.get('id')}). Updating to admin.")
        # Ensure admin flag is set
        db.cursor.execute(
            "UPDATE users SET is_admin = 1 WHERE id = %s",
            (existing['id'],)
        )
        db.conn.commit()
        db.close()
        return

    # Insert new user record (initial token balance is set in the model's add method)
    user_id = db.add(username, password_hash, email)
    # Grant admin rights
    db.cursor.execute(
        "UPDATE users SET is_admin = 1 WHERE id = %s",
        (user_id,)
    )
    db.conn.commit()
    db.close()
    print(f"✅ Admin user created with username='{username}', email='{email}'.")


if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python create_admin.py <username> <password> <email>")
        sys.exit(1)
    _, usr, pwd, mail = sys.argv
    create_admin(usr, pwd, mail)
