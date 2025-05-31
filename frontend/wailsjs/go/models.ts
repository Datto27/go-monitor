export namespace main {
	
	export class Resources {
	    totalMemory: number;
	    memoryAvailable: number;
	    memoryUsed: number;
	    memoryPercentage: number;
	    cpu: number;
	    cpuPercentage: number;
	    cpuThreads: number;
	    cpuModel: string;
	    cpuCores: number;
	    cpuModelName: string;
	    cpuGhz: number;
	    cpuCacheSize: number;
	
	    static createFrom(source: any = {}) {
	        return new Resources(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.totalMemory = source["totalMemory"];
	        this.memoryAvailable = source["memoryAvailable"];
	        this.memoryUsed = source["memoryUsed"];
	        this.memoryPercentage = source["memoryPercentage"];
	        this.cpu = source["cpu"];
	        this.cpuPercentage = source["cpuPercentage"];
	        this.cpuThreads = source["cpuThreads"];
	        this.cpuModel = source["cpuModel"];
	        this.cpuCores = source["cpuCores"];
	        this.cpuModelName = source["cpuModelName"];
	        this.cpuGhz = source["cpuGhz"];
	        this.cpuCacheSize = source["cpuCacheSize"];
	    }
	}

}

