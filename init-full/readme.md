# init-full
Filter that creates bedrock manifest files on install

## How to use
1. Run the regular `regolith init` command

2. Run this command
```
regolith install github.com/Hatchibombotar/useful-regolith-filters/init-full==latest
```

3. Fill in all the information it asks, it will uninstall itself once finished.

You now have two

## Extra information
- This filter completely supports gametest modules.
- This filter fills in the author and name attributes in the config.json file
- If gametest is not enabled, the dependencies will get automatically filled in.