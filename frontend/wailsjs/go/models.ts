export namespace main {
	
	export class InfoT {
	    cpuThreads: number;
	    cpuModel: string;
	    cpuCores: number;
	    cpuModelName: string;
	    cpuGhz: number;
	    cpuCacheSize: number;
	    cpu: number;
	    totalMemory: number;
	
	    static createFrom(source: any = {}) {
	        return new InfoT(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.cpuThreads = source["cpuThreads"];
	        this.cpuModel = source["cpuModel"];
	        this.cpuCores = source["cpuCores"];
	        this.cpuModelName = source["cpuModelName"];
	        this.cpuGhz = source["cpuGhz"];
	        this.cpuCacheSize = source["cpuCacheSize"];
	        this.cpu = source["cpu"];
	        this.totalMemory = source["totalMemory"];
	    }
	}
	export class StatsT {
	    memoryAvailable: number;
	    memoryUsed: number;
	    memoryPercentage: number;
	    cpuPercentage: number;
	
	    static createFrom(source: any = {}) {
	        return new StatsT(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.memoryAvailable = source["memoryAvailable"];
	        this.memoryUsed = source["memoryUsed"];
	        this.memoryPercentage = source["memoryPercentage"];
	        this.cpuPercentage = source["cpuPercentage"];
	    }
	}

}

