from app import create_app, db
from app.models import Miner, User

app = create_app()

with app.app_context():
    db.create_all()
    
    if Miner.query.count() == 0:
        miners = [
            Miner(
                name='Antminer S19 Pro',
                model='S19 Pro',
                hashrate_th=110.0,
                price_usd=1950.0,
                efficiency=29.5,
                power_watts=3250,
                available_units=50,
                description='High-performance Bitcoin miner with industry-leading efficiency',
                image_url='https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400'
            ),
            Miner(
                name='Antminer S19 XP',
                model='S19 XP',
                hashrate_th=140.0,
                price_usd=2800.0,
                efficiency=21.5,
                power_watts=3010,
                available_units=30,
                description='Premium mining hardware with superior hashrate and efficiency',
                image_url='https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400'
            ),
            Miner(
                name='Whatsminer M30S++',
                model='M30S++',
                hashrate_th=112.0,
                price_usd=2100.0,
                efficiency=31.0,
                power_watts=3472,
                available_units=40,
                description='Reliable and powerful mining solution',
                image_url='https://images.unsplash.com/photo-1639322537228-f710d846310a?w=400'
            ),
            Miner(
                name='AvalonMiner 1246',
                model='A1246',
                hashrate_th=90.0,
                price_usd=1600.0,
                efficiency=38.0,
                power_watts=3420,
                available_units=60,
                description='Cost-effective mining solution for beginners',
                image_url='https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400'
            ),
            Miner(
                name='Antminer S19j Pro',
                model='S19j Pro',
                hashrate_th=100.0,
                price_usd=1750.0,
                efficiency=30.0,
                power_watts=3000,
                available_units=70,
                description='Balanced performance and efficiency for cloud mining',
                image_url='https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=400'
            ),
            Miner(
                name='Fractional 10TH/s Plan',
                model='S19 Pro (Fraction)',
                hashrate_th=10.0,
                price_usd=175.0,
                efficiency=29.5,
                power_watts=295,
                available_units=500,
                description='Affordable entry-level mining plan with 30-day duration',
                image_url='https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400'
            )
        ]
        
        for miner in miners:
            db.session.add(miner)
        
        admin_user = User(
            email='admin@cloudminer.com',
            referral_code='ADMIN001',
            is_admin=True
        )
        admin_user.set_password('admin123')
        db.session.add(admin_user)
        
        db.session.commit()
        print(f"✅ Seeded {len(miners)} miners and 1 admin user!")
    else:
        print("⚠️  Database already contains miners. Skipping seed.")
