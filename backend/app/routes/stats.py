from flask import Blueprint, jsonify
from app.utils.api_fetcher import get_network_stats

bp = Blueprint('stats', __name__, url_prefix='/api/stats')

@bp.route('/network', methods=['GET'])
def get_network():
    try:
        stats = get_network_stats()
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
