import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import inspect
from app import create_app, db
from app.models import User, Miner, Rental, Referral, Payment, Payout, SystemSettings

app = create_app()

with app.app_context():
    inspector = inspect(db.engine)
    if not inspector.has_table("users"):
        db.create_all()
        SystemSettings.initialize_defaults()

@app.shell_context_processor
def make_shell_context():
    return {
        'db': db,
        'User': User,
        'Miner': Miner,
        'Rental': Rental,
        'Referral': Referral,
        'Payment': Payment,
        'Payout': Payout
    }

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3000))
    app.run(host='0.0.0.0', port=port, debug=True)
