export namespace main {
	
	export class DiskIOT {
	    name: string;
	    readBytes: number;
	    writeBytes: number;
	    readCount: number;
	    writeCount: number;
	
	    static createFrom(source: any = {}) {
	        return new DiskIOT(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.readBytes = source["readBytes"];
	        this.writeBytes = source["writeBytes"];
	        this.readCount = source["readCount"];
	        this.writeCount = source["writeCount"];
	    }
	}
	export class DiskPartitionT {
	    device: string;
	    mountpoint: string;
	    fstype: string;
	    total: number;
	    used: number;
	    free: number;
	    usedPercent: number;
	
	    static createFrom(source: any = {}) {
	        return new DiskPartitionT(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.device = source["device"];
	        this.mountpoint = source["mountpoint"];
	        this.fstype = source["fstype"];
	        this.total = source["total"];
	        this.used = source["used"];
	        this.free = source["free"];
	        this.usedPercent = source["usedPercent"];
	    }
	}
	export class DiskStatsT {
	    partitions: DiskPartitionT[];
	    io: DiskIOT[];
	
	    static createFrom(source: any = {}) {
	        return new DiskStatsT(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.partitions = this.convertValues(source["partitions"], DiskPartitionT);
	        this.io = this.convertValues(source["io"], DiskIOT);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class FanT {
	    label: string;
	    rpm: number;
	
	    static createFrom(source: any = {}) {
	        return new FanT(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.label = source["label"];
	        this.rpm = source["rpm"];
	    }
	}
	export class GpuT {
	    name: string;
	    utilPercent: number;
	    memUsed: number;
	    memTotal: number;
	    memPercent: number;
	    temp: number;
	    fanPercent: number;
	    powerDraw: number;
	
	    static createFrom(source: any = {}) {
	        return new GpuT(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.utilPercent = source["utilPercent"];
	        this.memUsed = source["memUsed"];
	        this.memTotal = source["memTotal"];
	        this.memPercent = source["memPercent"];
	        this.temp = source["temp"];
	        this.fanPercent = source["fanPercent"];
	        this.powerDraw = source["powerDraw"];
	    }
	}
	export class InfoT {
	    cpuThreads: number;
	    cpuModel: string;
	    cpuCores: number;
	    cpuModelName: string;
	    cpuGhz: number;
	    cpuCacheSize: number;
	    cpu: number;
	    totalMemory: number;
	    OS: string;
	    platform: string;
	    platformVersion: string;
	
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
	        this.OS = source["OS"];
	        this.platform = source["platform"];
	        this.platformVersion = source["platformVersion"];
	    }
	}
	export class NetInterfaceT {
	    name: string;
	    bytesSent: number;
	    bytesRecv: number;
	
	    static createFrom(source: any = {}) {
	        return new NetInterfaceT(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.bytesSent = source["bytesSent"];
	        this.bytesRecv = source["bytesRecv"];
	    }
	}
	export class SensorT {
	    key: string;
	    temperature: number;
	    category: string;
	
	    static createFrom(source: any = {}) {
	        return new SensorT(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.key = source["key"];
	        this.temperature = source["temperature"];
	        this.category = source["category"];
	    }
	}
	export class StatsT {
	    memoryAvailable: number;
	    memoryUsed: number;
	    memoryPercentage: number;
	    swapUsed: number;
	    swapTotal: number;
	    swapPercentage: number;
	    cpuPercentage: number;
	    cpuCores: number[];
	    cpuTemp: number;
	    sysTemp: number;
	    uptime: number;
	    loadAvg1: number;
	    loadAvg5: number;
	    loadAvg15: number;
	
	    static createFrom(source: any = {}) {
	        return new StatsT(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.memoryAvailable = source["memoryAvailable"];
	        this.memoryUsed = source["memoryUsed"];
	        this.memoryPercentage = source["memoryPercentage"];
	        this.swapUsed = source["swapUsed"];
	        this.swapTotal = source["swapTotal"];
	        this.swapPercentage = source["swapPercentage"];
	        this.cpuPercentage = source["cpuPercentage"];
	        this.cpuCores = source["cpuCores"];
	        this.cpuTemp = source["cpuTemp"];
	        this.sysTemp = source["sysTemp"];
	        this.uptime = source["uptime"];
	        this.loadAvg1 = source["loadAvg1"];
	        this.loadAvg5 = source["loadAvg5"];
	        this.loadAvg15 = source["loadAvg15"];
	    }
	}

}

