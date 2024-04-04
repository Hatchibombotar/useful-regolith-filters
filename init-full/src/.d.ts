type LatestMinecraftVersionData = {
    latestPreview: string,
    latestRelease: string,
}

type Result<T> = [T, null] | [null, T]