import * as semver from "semver";

const REGISTRY = 'https://registry.npmjs.org/';
const ignoredKeys = ['created', 'modified'];

export const versionRegex = /^\d+\.\d+\.\d+(\.\d+)?$/;
const globalMinecraftModules = ["@minecraft/common"];

export function splitVersion(versionString, platform) {
    const parsedVersion = semver.parse(versionString);

    if (!parsedVersion) {
        // invalid version string
        return null;
    }

    const { major, minor, patch, prerelease } = parsedVersion;
    const moduleChannel = prerelease[0]?.toString();
    const moduleVersion = `${major}.${minor}.${patch}-${moduleChannel}`;
    const engineVersion = versionString.replace(`${moduleVersion}.`, '')
        .replace(/^preview\.(\d+\.\d+\.\d+)\.(\d+)$/, "$1-preview.$2")
        .replace(/^release\.(\d+\.\d+\.\d+)$/, "$1-stable");

    if (platform === "minecraft") {
        // stable version
        if (!moduleChannel || moduleChannel === 'rc') return { moduleVersion: `${major}.${minor}.${patch}`, engineVersion: '' };
        // prerelease version
        else return { moduleVersion, engineVersion };
    }
    else {
        // stable version
        if (!moduleChannel) return { moduleVersion: `${major}.${minor}.${patch}`, engineVersion: '' };
        // prerelease version
        return { moduleVersion, engineVersion };
    }
};

/**
 * 
 * @param {string} npmVersion e.g:
 * 1.10.0-beta.1.20.70-stable -> 1.10.0-beta
 * 1.11.0-rc.1.21.0-preview.20 -> 1.11.0
 * 1.9.0 -> 1.9.0
 */
export function npmVersionToGameVersion(npmVersion) {
    const betaVersion = npmVersion.match(/^(.*-beta)/g)
    if (betaVersion) {
        return {version: betaVersion[0], type: "beta"}
    }

    const rcVersion = npmVersion.match(/^(.*)-rc/m)
    if (rcVersion) {
        return {version: rcVersion[1], type: "rc"}
    }

    return {version: npmVersion, type: ""}
}
/**
 * 
 * @param mcVersion Minecraft version
 * @param moduleName Minecraft module_name
 */
export async function getVersions(mcVersion, moduleName) {
    if (!versionRegex.test(mcVersion)) {
        throw new Error('Invalid version. Accept "1.0.0" for stable version, or "1.0.0.0" for preview version.');
    };

    const [major, minor, patch, revision] = mcVersion.split('.');
    const versionString = !revision ? `${major}.${minor}.${patch}-stable` : `${major}.${minor}.${patch}-preview.${revision}`;
    const response = await fetch(REGISTRY + moduleName);
    const packument = await response.json()
    const { time } = packument;

    for (const key of ignoredKeys) {
        delete time[key];
    };

    /**
     * Complete version list, sorted by latest
     * Example version format
     * 1.1.0-beta.1.19.0-preview.25
     * 1.0.0-rc.1.19.0-preview.25
     * 0.1.0
     */
    const versionsList = Object.keys(time).sort(function (a, b) {
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return new Date(time[a]).getTime() - new Date(time[b]).getTime();
    }).reverse().map(v => v.replace(/\^|\~/, ''));

    const latestVersions = versionsList.filter(v => semver.parse(v).prerelease.length === 0) ?? ["0.0.0"];
    const latestVersion = versionsList.find(v => semver.parse(v).prerelease.length === 0) ?? "0.0.0";

    const latestBeta = versionsList.find(v => {
        const { moduleVersion, engineVersion } = splitVersion(v, "npm");
        const [channel] = semver.parse(v).prerelease;
        return channel === 'beta' && semver.compare(moduleVersion, latestVersion) > 0 && (semver.compare(engineVersion, versionString) === 0 || semver.compare(engineVersion, versionString) < 0)
    });

    const latestRcs = versionsList.filter(v => {
        const { moduleVersion, engineVersion } = splitVersion(v, "npm");
        const [channel] = semver.parse(v).prerelease;
        return channel === 'rc' && semver.compare(moduleVersion, latestVersion) > 0 && semver.compare(engineVersion, versionString) === 0
    });

    // mojang minecraft common module is way too special.
    if (!latestBeta && globalMinecraftModules.includes(moduleName) && mcVersion.split('.').length === 3) return latestVersions;
    else if (!latestBeta && globalMinecraftModules.includes(moduleName) && mcVersion.split('.').length === 4) return [...latestRcs, ...latestVersions];
    else if (!latestBeta && !globalMinecraftModules.includes(moduleName)) console.error("No latest beta version found for '" + moduleName + "'. Please check the version string or try again later.");

    // definitely normal api modules
    return [latestBeta, ...latestRcs, ...latestVersions];
};


// please do not break the pipeline mammerla
/**
 * 
 * @returns {Promise<LatestMinecraftVersionData>}
 */
export async function getMinecraftVersion() {
    const branches = ["main", "preview"];
    const responseDetails = await Promise.all(branches.map(
        async branch => await (
            await fetch(`https://raw.githubusercontent.com/Mojang/bedrock-samples/${branch}/version.json`)
        ).json()
    ))

    const versionStrings = responseDetails.map(r => r.latest.version);
    const versions = versionStrings.map(r => r.split('.').map(v => parseInt(v)));

    let latestPreview;
    let latestRelease;

    // sort whether version is preview or not
    // if revision version is higher than 20, it's preview
    // otherwise if version is between 0-19, it's stable
    for (const v of versions) {
        if (v[3] >= 20 && !latestPreview) latestPreview = v.join('.')
        else if (v[3] >= 0 && !latestRelease) {
            v.pop();
            latestRelease = v.join('.')
        }
    }

    return { latestPreview, latestRelease };
};