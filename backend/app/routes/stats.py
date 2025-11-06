import logging
from flask import Blueprint, jsonify, current_app
from app.utils.api_fetcher import get_network_stats

bp = Blueprint('stats', __name__, url_prefix='/api/stats')

@bp.route('/network', methods=['GET'])
def get_network():
    current_app.logger.debug('Fetching network stats')
    try:
        stats = get_network_stats()
        current_app.logger.info(f'Network stats retrieved: BTC=${stats.get("btc_price", 0):,.2f}')
        return jsonify(stats), 200
    except Exception as e:
        current_app.logger.error(f'Error fetching network stats: {str(e)}', exc_info=True)
        return jsonify({'error': str(e)}), 500
