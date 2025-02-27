if pnpm -v > /dev/null 2>&1; then
  if [ ! -d node_modules ]; then
    pnpm i
  fi

  if ! pnpm run check:ci; then
    if ! pnpm run format:ci; then
      pnpm run format
    fi

    if ! pnpm run lint:ci; then
      pnpm run lint
    fi

    git add .
    git commit -m "autofix: biome check"
  fi
fi
