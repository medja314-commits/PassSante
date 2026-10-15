@AGENTS.md

## Règles Git (obligatoires)
- Plus de push direct sur `main` ni sur `frontend`.
- Chaque changement passe par une branche créée depuis `main` (`feat/m<n>-<sujet>`, `fix/…`, `chore/…`), puis une Pull Request vers `main`, relue par un autre membre.
- Avant chaque commit : relire `git diff`. Les fichiers `.env*` ne sont jamais committés.
