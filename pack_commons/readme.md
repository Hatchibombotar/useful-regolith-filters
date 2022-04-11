# Pack Commons
Intended to allow copying of files into both the resource and behaviour packs

### Install Latest
```
regolith install github.com/Hatchibombotar/useful-regolith-filters/pack_commons==latest
```

You can get the files to be copied in two ways:
## 1 - commons.json
On installation a file will be created in `data/pack_commons/commons.json`. Add the paths (relative to the project root) to the common_files section.
### Example:
```json
{
    "common_files": [
        "readme.md",
        "licence.txt"
    ]
}
```
## 2 - Commons file
You can also add files to `data/pack_commons` to have them copy.
### Example:
data/pack_commons/pack_icon.png
