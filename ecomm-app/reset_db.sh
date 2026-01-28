#!/bin/bash
echo "🛑 Eliminando datos de usuarios y tenants (preservando modulos)..."
docker compose exec mongo mongosh saas_ecommerce --eval "
    try { db.users.drop(); } catch (e) { print('Users collection not found'); }
    try { db.tenants.drop(); } catch (e) { print('Tenants collection not found'); }
    try { db.orders.drop(); } catch (e) { print('Orders collection not found'); }
    try { db.products.drop(); } catch (e) { print('Products collection not found'); }
    print('✅ Base de datos limpia. Módulos preservados.');
"
