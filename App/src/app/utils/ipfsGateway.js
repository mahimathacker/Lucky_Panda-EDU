const CACHE_PREFIX = "ipfs-json:";
const LOCAL_METADATA_PREFIX = "local://metadata/";

export function createLocalMetadataUri(id) {
  return `${LOCAL_METADATA_PREFIX}${id}`;
}

export function isSupportedMetadataUri(uri) {
  return (
    Boolean(uri) &&
    (uri.startsWith(LOCAL_METADATA_PREFIX) ||
      uri.startsWith("data:application/json"))
  );
}

export function getCidFromIpfsUrl(uri) {
  if (!uri) return "";

  if (uri.startsWith("ipfs://")) {
    return uri.replace("ipfs://", "").replace(/^ipfs\//, "");
  }

  const marker = "/ipfs/";
  const markerIndex = uri.indexOf(marker);
  if (markerIndex >= 0) {
    return uri.slice(markerIndex + marker.length);
  }

  return uri;
}

function getCacheKeys(uri) {
  const cid = getCidFromIpfsUrl(uri);
  return [
    uri ? `${CACHE_PREFIX}${uri}` : null,
    cid ? `${CACHE_PREFIX}${cid}` : null,
  ].filter(Boolean);
}

export function cacheIpfsJson(uri, data) {
  if (typeof window === "undefined" || !window.localStorage || !uri || !data) {
    return;
  }

  const json = JSON.stringify(data);
  getCacheKeys(uri).forEach((key) => {
    window.localStorage.setItem(key, json);
  });
}

export async function fetchIpfsJson(uri) {
  if (typeof window !== "undefined" && window.localStorage) {
    for (const key of getCacheKeys(uri)) {
      const cached = window.localStorage.getItem(key);
      if (cached) {
        try {
          return {
            data: JSON.parse(cached),
            url: uri,
            cached: true,
          };
        } catch (error) {
          window.localStorage.removeItem(key);
        }
      }
    }
  }

  if (!uri || uri.startsWith(LOCAL_METADATA_PREFIX)) {
    return {
      data: null,
      url: uri,
      unavailable: true,
    };
  }

  if (uri.startsWith("data:application/json")) {
    try {
      const [, dataPart = ""] = uri.split(",");
      const isBase64 = uri.slice(0, uri.indexOf(",")).includes(";base64");
      const json = isBase64 ? atob(dataPart) : decodeURIComponent(dataPart);
      const data = JSON.parse(json);
      cacheIpfsJson(uri, data);
      return {
        data,
        url: uri,
      };
    } catch (error) {
      return {
        data: null,
        url: uri,
        unavailable: true,
        message: error.message,
      };
    }
  }

  return {
    data: null,
    url: uri,
    unavailable: true,
  };
}
