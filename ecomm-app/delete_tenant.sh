#!/bin/bash

if [ -z "$1" ]; then
    echo "Uso: ./delete_tenant.sh <slug_del_tenant>"
    echo "Ejemplo: ./delete_tenant.sh alma"
    exit 1
fi

SLUG=$1

echo "🔍 Buscando y eliminando tenant: $SLUG ..."

docker compose exec mongo mongosh saas_ecommerce --eval "
    var t = db.tenants.findOne({slug: '$SLUG'});
    if (t) {
        if (t.owner) {
            db.users.deleteOne({_id: t.owner});
            print('✅ Usuario propietario eliminado.');
        }
        db.tenants.deleteOne({_id: t._id});
        print('✅ Tenant $SLUG eliminado.');
    } else {
        print('❌ Tenant no encontrado: $SLUG');
    }
"
