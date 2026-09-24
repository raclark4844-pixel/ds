# Lead Engine upgrade release hold

The upgrade belongs in the existing `raclark4844-pixel/ds` website and repository. No new repository is needed. `dtslg` is a contingency only, not the chosen destination.

Do not publish this branch to Vercel, run production migrations, activate customer billing, or send outreach until upgrades are complete, tested, and the user releases this hold. Local development and tests remain authorized. GitHub pushes require verification that they cannot trigger publication.

The branch's `vercel.json` disables Git deployments and the normal build command rejects hosted Vercel environments while this file exists. Do not override the build command or manually deploy the generated output to bypass this hold.
