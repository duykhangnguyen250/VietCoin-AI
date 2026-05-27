import pymysql
import pymysql.cursors
from app.config import settings

class BaseDB:
    def __init__(self, init_db=False):
        try:
            self.conn = pymysql.connect(
                host=settings.DB_HOST,
                user=settings.DB_USER,
                password=settings.DB_PASSWORD,
                database=settings.DB_NAME,
                port=settings.DB_PORT,
                cursorclass=pymysql.cursors.DictCursor,
                autocommit=True
            )
        except pymysql.err.OperationalError as e:
            if e.args[0] == 1049:  # Unknown database
                print(f"[*] Database '{settings.DB_NAME}' not found. Creating it...")
                temp_conn = pymysql.connect(
                    host=settings.DB_HOST,
                    user=settings.DB_USER,
                    password=settings.DB_PASSWORD,
                    port=settings.DB_PORT,
                    autocommit=True
                )
                temp_cursor = temp_conn.cursor()
                temp_cursor.execute(f"CREATE DATABASE IF NOT EXISTS {settings.DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
                temp_cursor.close()
                temp_conn.close()
                
                # Reconnect
                self.conn = pymysql.connect(
                    host=settings.DB_HOST,
                    user=settings.DB_USER,
                    password=settings.DB_PASSWORD,
                    database=settings.DB_NAME,
                    port=settings.DB_PORT,
                    cursorclass=pymysql.cursors.DictCursor,
                    autocommit=True
                )
            else:
                raise e

        # Ensure connection is alive
        self.conn.ping(reconnect=True)
        self.cursor = self.conn.cursor()
        
        if init_db:
            self._init_db()

    def _init_db(self):
        # Tạo các bảng nếu chưa có
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) UNIQUE,
                password VARCHAR(255),
                email VARCHAR(255) UNIQUE,
                full_name VARCHAR(255),
                picture_url TEXT,
                token_balance FLOAT DEFAULT 0,
                is_admin TINYINT(1) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        # Note: In MySQL, it's actually:
        # CREATE TABLE IF NOT EXISTS users (
        #     id INT AUTO_INCREMENT PRIMARY KEY,
        #     ...
        # )
        # I'll use MySQL syntax since it's connected to MySQL
        
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS token_history (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                amount FLOAT,
                description TEXT,
                type ENUM('in', 'out'),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS packages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255),
                tokens INT,
                amount_vnd INT
            )
        """)
        
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS payments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                package_id INT,
                amount_vnd INT,
                tokens INT,
                status VARCHAR(50) DEFAULT 'pending',
                sepay_id VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS settings (
                `key` VARCHAR(255) PRIMARY KEY,
                value TEXT
            )
        """)
        
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS payment_reports (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                payment_id INT,
                description TEXT,
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS login_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                ip_address VARCHAR(255),
                user_agent TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Default settings
        self.cursor.execute("INSERT IGNORE INTO settings (`key`, value) VALUES ('site_title', 'VietCoin AI')")
        self.cursor.execute("INSERT IGNORE INTO settings (`key`, value) VALUES ('rate_per_1000', '1.0')")

    def close(self):
        self.cursor.close()
        self.conn.close()

class UserDB(BaseDB):
    def get_by_email(self, email):
        self.cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        return self.cursor.fetchone()

    def get_by_username(self, username):
        self.cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
        return self.cursor.fetchone()

    def add(self, username, password_hash, email):
        self.cursor.execute(
            "INSERT INTO users (username, password, email, token_balance) VALUES (%s, %s, %s, 10)",
            (username, password_hash, email)
        )
        return self.cursor.lastrowid

    def log_login(self, user_id, ip, agent):
        self.cursor.execute(
            "INSERT INTO login_logs (user_id, ip_address, user_agent) VALUES (%s, %s, %s)",
            (user_id, ip, agent)
        )

    def get_token_history(self, user_id):
        self.cursor.execute(
            "SELECT * FROM token_history WHERE user_id = %s ORDER BY created_at DESC",
            (user_id,)
        )
        return self.cursor.fetchall()

    def update_or_create_google_user(self, email, name, picture):
        user = self.get_by_email(email)
        if user:
            self.cursor.execute(
                "UPDATE users SET full_name = %s, picture_url = %s WHERE email = %s",
                (name, picture, email)
            )
            return self.get_by_email(email)
        else:
            username = email.split('@')[0]
            # Handle username collision
            base_username = username
            counter = 1
            while self.get_by_username(username):
                username = f"{base_username}{counter}"
                counter += 1
            
            self.cursor.execute(
                "INSERT INTO users (username, email, full_name, picture_url, token_balance) VALUES (%s, %s, %s, %s, 10)",
                (username, email, name, picture)
            )
            return self.get_by_email(email)

    def update_user_info(self, user_id, **kwargs):
        if not kwargs:
            return
        fields = ", ".join([f"{k} = %s" for k in kwargs.keys()])
        values = list(kwargs.values())
        values.append(user_id)
        self.cursor.execute(f"UPDATE users SET {fields} WHERE id = %s", tuple(values))

    def update_user_password(self, user_id, password_hash):
        self.cursor.execute("UPDATE users SET password = %s WHERE id = %s", (password_hash, user_id))

    def get_all(self, page: int = None, limit: int = None, search: str = None):
        sql = "SELECT * FROM users"
        params = []
        if search:
            sql += " WHERE username LIKE %s OR email LIKE %s OR full_name LIKE %s"
            search_pattern = f"%{search}%"
            params.extend([search_pattern, search_pattern, search_pattern])
        sql += " ORDER BY id DESC"
        if limit is not None and page is not None:
            sql += " LIMIT %s OFFSET %s"
            offset = (page - 1) * limit
            params.extend([limit, offset])
        
        self.cursor.execute(sql, tuple(params))
        return self.cursor.fetchall()

    def get_total_count(self, search: str = None):
        sql = "SELECT COUNT(*) as total FROM users"
        params = []
        if search:
            sql += " WHERE username LIKE %s OR email LIKE %s OR full_name LIKE %s"
            search_pattern = f"%{search}%"
            params.extend([search_pattern, search_pattern, search_pattern])
        self.cursor.execute(sql, tuple(params))
        res = self.cursor.fetchone()
        return res['total'] if res else 0

    def change_token_balance(self, user_id, amount, description, tx_type):
        if tx_type == 'in':
            self.cursor.execute("UPDATE users SET token_balance = token_balance + %s WHERE id = %s", (amount, user_id))
        else:
            self.cursor.execute("UPDATE users SET token_balance = token_balance - %s WHERE id = %s", (amount, user_id))
        
        self.cursor.execute(
            "INSERT INTO token_history (user_id, amount, description, type) VALUES (%s, %s, %s, %s)",
            (user_id, amount, description, tx_type)
        )
        
        self.cursor.execute("SELECT token_balance FROM users WHERE id = %s", (user_id,))
        res = self.cursor.fetchone()
        return res['token_balance'] if res else 0

    def delete_user(self, user_id):
        queries = [
            "DELETE FROM login_logs WHERE user_id = %s",
            "DELETE FROM payment_reports WHERE user_id = %s",
            "DELETE FROM payments WHERE user_id = %s",
            "DELETE FROM token_history WHERE user_id = %s",
            "DELETE FROM coin_predictions WHERE user_id = %s",
            "DELETE FROM user_memory WHERE user_id = %s",
            "DELETE FROM users WHERE id = %s"
        ]
        for query in queries:
            try:
                self.cursor.execute(query, (user_id,))
            except pymysql.err.ProgrammingError as e:
                # 1146 is MySQL code for "Table doesn't exist"
                if e.args[0] == 1146:
                    continue
                raise e

    def get_packages(self):
        self.cursor.execute("SELECT * FROM packages")
        return self.cursor.fetchall()

    def add_package(self, name, tokens, amount_vnd):
        self.cursor.execute(
            "INSERT INTO packages (name, tokens, amount_vnd) VALUES (%s, %s, %s)",
            (name, tokens, amount_vnd)
        )

    def delete_package(self, package_id):
        self.cursor.execute("DELETE FROM packages WHERE id = %s", (package_id,))

    def update_package(self, package_id, name, tokens, amount_vnd):
        self.cursor.execute(
            "UPDATE packages SET name = %s, tokens = %s, amount_vnd = %s WHERE id = %s",
            (name, tokens, amount_vnd, package_id)
        )

    def get_all_token_history(self):
        self.cursor.execute("""
            SELECT th.*, u.username, u.email 
            FROM token_history th 
            JOIN users u ON th.user_id = u.id 
            ORDER BY th.created_at DESC
        """)
        return self.cursor.fetchall()

    def get_all_payments(self):
        self.cursor.execute("""
            SELECT p.*, u.username, u.email 
            FROM payments p 
            JOIN users u ON p.user_id = u.id 
            ORDER BY p.created_at DESC
        """)
        return self.cursor.fetchall()

    def get_setting(self, key, default=None):
        self.cursor.execute("SELECT value FROM settings WHERE `key` = %s", (key,))
        res = self.cursor.fetchone()
        return res['value'] if res else default

    def set_setting(self, key, value):
        self.cursor.execute(
            "INSERT INTO settings (`key`, value) VALUES (%s, %s) ON DUPLICATE KEY UPDATE value = %s",
            (key, value, value)
        )

    def get_recent_logins(self, limit=50):
        self.cursor.execute("""
            SELECT l.*, u.username, u.email 
            FROM login_logs l 
            JOIN users u ON l.user_id = u.id 
            ORDER BY l.created_at DESC 
            LIMIT %s
        """, (limit,))
        return self.cursor.fetchall()

    def get_all_payment_reports(self):
        self.cursor.execute("""
            SELECT r.*, u.username, u.email 
            FROM payment_reports r 
            JOIN users u ON r.user_id = u.id 
            ORDER BY r.created_at DESC
        """)
        return self.cursor.fetchall()

    def get_payment(self, payment_id):
        self.cursor.execute("SELECT * FROM payments WHERE id = %s", (payment_id,))
        return self.cursor.fetchone()

    def update_payment_status(self, payment_id, status):
        self.cursor.execute("UPDATE payments SET status = %s WHERE id = %s", (status, payment_id))

    def create_payment(self, user_id, package_id, amount_vnd, tokens):
        self.cursor.execute(
            "INSERT INTO payments (user_id, package_id, amount_vnd, tokens) VALUES (%s, %s, %s, %s)",
            (user_id, package_id, amount_vnd, tokens)
        )
        return self.cursor.lastrowid

    def get_payment_by_sepay_id(self, sepay_id):
        self.cursor.execute("SELECT * FROM payments WHERE sepay_id = %s", (sepay_id,))
        return self.cursor.fetchone()

    def create_payment_report(self, user_id, payment_id, description):
        self.cursor.execute(
            "INSERT INTO payment_reports (user_id, payment_id, description) VALUES (%s, %s, %s)",
            (user_id, payment_id, description)
        )
