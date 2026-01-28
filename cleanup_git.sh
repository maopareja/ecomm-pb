#!/bin/bash
# Script para limpiar el repositorio Git de archivos grandes y no deseados

echo "🧹 Limpiando repositorio Git..."

# 1. Remover archivos del índice que ahora están en .gitignore
echo ""
echo "📋 Paso 1: Removiendo archivos ignorados del índice de Git..."
git rm -r --cached ecomm-app/mongodb/data/ 2>/dev/null || true
git rm -r --cached ecomm-app/backend/**/__pycache__/ 2>/dev/null || true
git rm -r --cached ecomm-app/frontend/node_modules/ 2>/dev/null || true
git rm -r --cached ecomm-app/frontend/.next/ 2>/dev/null || true
git rm -r --cached **/__pycache__/ 2>/dev/null || true
git rm -r --cached **/*.pyc 2>/dev/null || true
git rm --cached **/.DS_Store 2>/dev/null || true

# 2. Agregar .gitignore
echo ""
echo "📋 Paso 2: Agregando .gitignore..."
git add ../.gitignore

# 3. Mostrar estado
echo ""
echo "📋 Paso 3: Estado actual del repositorio..."
git status --short | head -30

echo ""
echo "✅ Limpieza completada!"
echo ""
echo "📝 Próximos pasos:"
echo "   1. Revisar los cambios con: git status"
echo "   2. Hacer commit: git commit -m 'chore: add .gitignore and remove tracked ignored files'"
echo "   3. Hacer push: git push origin main"
echo ""
echo "⚠️  Si el repositorio ya tiene archivos grandes en el historial:"
echo "   Usar: git filter-repo o BFG Repo-Cleaner para limpiar el historial completo"
echo "   Documentación: https://git-scm.com/book/en/v2/Git-Tools-Rewriting-History"
