class GeoData {
    private geoData: Map<string, Map<string, any>> = new Map();
    public setProp(geohash: string, propKey: string, propValue: any) {
        if (!this.geoData.has(geohash)) {
            this.geoData.set(geohash, new Map());
        }
        const propMap = this.geoData.get(geohash)!;
        propMap.set(propKey, propValue);
    }
    public getProp(geohash: string, propKey: string): any | undefined {
        const propMap = this.geoData.get(geohash);
        return propMap ? propMap.get(propKey) : undefined;
    }
    public hasProp(geohash: string, propKey: string): boolean {
        const propMap = this.geoData.get(geohash);
        return propMap ? propMap.has(propKey) : false;
    }
}

export const store = new GeoData();

if (typeof window !== "undefined") {
    (window as any)._geoDataStore = store;
}
