import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from app import create_app, db
from app.models import User, Miner, Rental, Referral, Payment, Payout

app = create_app()

with app.app_context():
    db.create_all()

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
