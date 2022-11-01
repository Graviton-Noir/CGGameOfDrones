
type Point = {
    x: number;
    y: number;
};

function vector2DLength(p1: Point, p2: Point): number {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
}

class Zone {
    id: number
    position: Point
    ownership: number
    futurOwnerShip: number

    overringDrones: number[] = []
    futurOverringDrones: number[] = []

    incomingDrone: Drone[] = []

    enemyPower: number

    constructor(p: Point, id: number) {
        this.position = {x: p.x, y: p.y}
        this.id = id

        this.ownership = -1
        this.futurOwnerShip = -1

        this.enemyPower = 0
    }

    setOverringDronesArray(playerArray: Player[]) {

        let output: number[] = Array(P).fill(0)
        for (let i = 0 ; i < playerArray.length; i++) {

            let currPlayer = playerArray[i]

            for (let j = 0; j < currPlayer.droneArray.length; j++) {

                let currDrone = currPlayer.droneArray[j]

                if (vector2DLength(currDrone.position, this.position) <= zoneWidth)
                {
                    output[i]++
                    currDrone.onZone = this.id
                }
            }
        }

        /* Counting enemy pawa */        
        this.enemyPower = 0
        for (let i = 0; i < P; i++) {
            if (i != ID && output[i] > this.enemyPower) {
                this.enemyPower = output[i]
            }
        }
        
        /* Copy into overringDrone */
        this.overringDrones = Object.assign([], output)
        this.futurOverringDrones = Object.assign([], output)
    }

    sortClosestDrones(droneArray: Drone[]): void {

        droneArray.sort((a, b) => {
            let distA : number = vector2DLength(a.position, this.position)
            let distB : number = vector2DLength(b.position, this.position)

            if (distA < distB) {
                return -1
            }
            else if (distA > distB) {
                return 1
            }
            return 0
        })
    }
}
let zoneArray: Zone[] = []
const zoneWidth: number = 100

class Drone {
    position: Point
    lastPosition : Point
    destination: Point
    destinationZone : number
    id : number

    onZone : number
    targetZone : number
    timeToTarget : number

    isMoving : boolean

    constructor() {
        this.position = {x: 0, y: 0}
        this.lastPosition = {x: 0, y: 0}
        this.destination = {x: 0, y: 0}
        this.onZone = -1
        this.targetZone = -1
        this.isMoving = false
        this.destinationZone = -1
        this.timeToTarget = 0
        this.id = -1
    }

    setPosition(p: Point) {
        this.position = {x: p.x, y: p.y}
    }

    setLastPosition() {
        this.lastPosition = {x: this.position.x, y: this.position.y}
    }

    setDestination(p: Point) {
        this.destination = {x: p.x, y: p.y}
    }

    setOnZone(zoneArray: Zone[]): void {
        for (let i = 0; i < Z; i++) {
            if (vector2DLength(this.position, zoneArray[i].position) < zoneWidth) {
                this.onZone = i;
                return;
            }
        }

        this.onZone = -1
    }

    setId(id: number): void {
        this.id = id
    }

    goToClosestZone(zoneArray: Zone[], playerArray: Player[]) {
        let dest: Point
        let closestDist: number = 10000

        for (let i = 0; i < zoneArray.length; i++) {
            let currDist = vector2DLength(this.position, zoneArray[i].position)

            if (currDist < closestDist) {
                closestDist = currDist
                dest = {x: zoneArray[i].position.x, y: zoneArray[i].position.y}
                this.destinationZone = i
            }
        }

        if (dest === undefined) {
            dest = {x: this.position.x, y: this.position.y}
        }

        this.destination = Object.assign({}, dest)
    }

    setIsMoving(): void {
        this.isMoving = (vector2DLength(this.position, this.destination) > zoneWidth)
    }

    setTargetZone(zoneArray: Zone[]) {

        this.targetZone = -1

        for (let i = 0; i < zoneArray.length; i++) {
            let dronePositionShift: Point = {x: this.position.x - zoneArray[i].position.x,
                                            y: this.position.y - zoneArray[i].position.y}

            let dr = Math.sqrt(Math.pow(this.lastPosition.x - this.position.x, 2) + Math.pow(this.lastPosition.y - this.position.y, 2))
            let theD = this.position.x * this.lastPosition.y - this.lastPosition.x * this.position.y

            if (40000 * dr * dr - theD * theD > 0) {
                this.targetZone = zoneArray[i].id
                return
            }
        }
    }

    setTimeToTarget(zoneArray: Zone[]): void {
        if (this.targetZone != -1) {
            this.timeToTarget = vector2DLength(this.position, zoneArray[this.targetZone].position) / 100
        }
    }

    sortClosestZones(zoneArray: Zone[]): void {

        zoneArray.sort((a, b) => {
            let distA : number = vector2DLength(this.position, a.position)
            let distB : number = vector2DLength(this.position, b.position)

            if (distA < distB) {
                return -1
            }
            else if (distA > distB) {
                return 1
            }
            return 0
        })
    }
}

class Player {
    id: number

    droneArray: Drone[] = []

    pointsGain: number
    futurPointsGain: number

    constructor(id: number) {
        this.id = id;
        this.pointsGain = 0
        this.futurPointsGain = 0
    }

    setPointsGain(zoneArray: Zone[]): void {

        let pt = 0

        for (let i = 0; i < Z; i++) {
            if (zoneArray[i].ownership == this.id) {
                pt++
            }
        }

        this.pointsGain = pt
    }

    setFuturPointsGain(zoneArray: Zone[]): void {

        let pt = 0

        for (let i = 0; i < Z; i++) {
            if (zoneArray[i].futurOwnerShip == this.id) {
                pt++
            }
        }

        this.pointsGain = pt
    }
}
let playerArray: Player[] = []

class Strategist {

    ptrPlayerArray: Player[]
    ptrZoneArray: Zone[]

    /* Remembers the last destinations */
    zoneConfigMem: Zone[] = []
    playerConfigMem: Player[] = []

    constructor(playerArray: Player[], zoneArray: Zone[]) {
        this.ptrPlayerArray = playerArray
        this.ptrZoneArray = zoneArray
    }

    tactics() {

        //let droneHasMoved: boolean[] = Array(D).fill(false)
        let availableDrones: Drone[] = []
        let weakZones: Zone[] = []

        /* Copies */
        this.playerConfigMem = Object.assign({}, this.ptrPlayerArray)
        this.zoneConfigMem = Object.assign({}, this.ptrZoneArray)

        this.computeAvailableDrones(availableDrones)

        /* ---- Agressif tactic */

        this.computeWeakestZonesAtk(weakZones)
        this.sortWeakestZones(weakZones)

        for (let i = 0; i < availableDrones.length; i++) {
            let currDrone = availableDrones[i]
            //let hasMoved: boolean = droneHasMoved[currDrone.id] // In case has already moved, if functions are added in the future

            // behavior functions
            if (this.tacticGoToWeakZone(currDrone, availableDrones.length, weakZones)) {
                availableDrones.splice(i, 1)
                continue
            }
            this.tacticGoToClosestZone(currDrone, this.ptrZoneArray)
        }

        this.keepBetterConfiguration()

        /* ---- Defense tactic */

        this.computeWeakestZonesDef(weakZones)
        this.sortWeakestZones(weakZones)

        for (let i = 0; i < availableDrones.length; i++) {
            let currDrone = availableDrones[i]
            //let hasMoved: boolean = droneHasMoved[currDrone.id] // In case has already moved, if functions are added in the future

            // behavior functions
            if (this.tacticGoToWeakZone(currDrone, availableDrones.length, weakZones)) {
                availableDrones.splice(i, 1)
                continue
            }
            this.tacticGoToClosestZone(currDrone, this.ptrZoneArray)
        }

        this.keepBetterConfiguration()
    }

    keepBetterConfiguration(): void {

        let myPointsGain = 0
        let enemyPointsGain = 0

        for (let i = 0; i < this.zoneConfigMem.length; i++) {
            if ()
        }
    }

    tacticGoToWeakZone(drone: Drone, availableDronesNb: number, weakZones: Zone[]): boolean {

        for (let i = 0; i < weakZones.length; i++) {

            let nbDroneToSend: number = weakZones[i].futurOverringDrones[ID] + availableDronesNb - weakZones[i].enemyPower
            if (nbDroneToSend <= 0) {
                continue
            }

            drone.setDestination(weakZones[i].position)
            drone.destinationZone = weakZones[i].id
            if (drone.onZone != weakZones[i].id) {
                weakZones[i].futurOverringDrones[ID]++
            }
            return true
        }

        return false
    }

    tacticGoToClosestZone(drone: Drone, zones: Zone[]): void {

        drone.sortClosestZones(zones)
        drone.setDestination(zones[0].position)
        drone.destinationZone = zones[0].id
        if (drone.onZone != zones[0].id) {
            zones[0].futurOverringDrones[ID]++
        }
    }

    computeAvailableDrones(availableDrones: Drone[]): void {

        for (let i = 0; i < D; i++) {
            let currDrone = this.ptrPlayerArray[ID].droneArray[i]

            if (currDrone.onZone != -1)
            {

                /* If the zone if owned, having the same amount of drone with the enemy shouldn't change the ownership */
                if (this.ptrZoneArray[currDrone.onZone].ownership == ID && this.ptrZoneArray[currDrone.onZone].futurOverringDrones[ID] > this.ptrZoneArray[currDrone.onZone].enemyPower)
                {
                    availableDrones.push(currDrone)
                    this.ptrZoneArray[currDrone.onZone].futurOverringDrones[ID]--
                }
                else if (this.ptrZoneArray[currDrone.onZone].ownership == -1 && this.ptrZoneArray[currDrone.onZone].futurOverringDrones[ID] == this.ptrZoneArray[currDrone.onZone].enemyPower)
                {
                    availableDrones.push(currDrone)
                    this.ptrZoneArray[currDrone.onZone].futurOverringDrones[ID]--
                }
                else if (this.ptrZoneArray[currDrone.onZone].futurOverringDrones[ID] - 1 > this.ptrZoneArray[currDrone.onZone].enemyPower)
                {
                    availableDrones.push(currDrone)
                    this.ptrZoneArray[currDrone.onZone].futurOverringDrones[ID]--
                    //console.error(this.ptrZoneArray[currDrone.onZone].futurOverringDrones[ID] + " " + this.ptrZoneArray[currDrone.onZone].enemyPower)
                }
                else if (this.ptrZoneArray[currDrone.onZone].enemyPower > Z / 2) {
                    availableDrones.push(currDrone)
                    this.ptrZoneArray[currDrone.onZone].futurOverringDrones[ID]--
                }
                else {
                    let NbOfStrongestEnemy = 0

                    for (let j = 0; j < P; j++) {
                        if (j != ID && this.ptrZoneArray[currDrone.onZone].futurOverringDrones[j] == this.ptrZoneArray[currDrone.onZone].enemyPower) {
                            NbOfStrongestEnemy++
                        }
                    }

                    if (NbOfStrongestEnemy >= 2) {
                        availableDrones.push(currDrone)
                        this.ptrZoneArray[currDrone.onZone].futurOverringDrones[ID]--
                    }
                }
            }
        }
    }

    computeWeakestZonesAtk(weakZones: Zone[]): void {
        for (let j = 0; j < Z; j++) {
            let currZone = this.ptrZoneArray[j]
            let isWeak = false

            if (currZone.ownership != ID) {
                isWeak = true
            }

            if (isWeak) {
                weakZones.push(currZone)
            }
        }
    }

    computeWeakestZonesDef(weakZones: Zone[]): void {
        for (let j = 0; j < Z; j++) {
            let currZone = this.ptrZoneArray[j]
            let isWeak = false

            if (currZone.ownership == ID) {
                isWeak = true
            }

            if (isWeak) {
                weakZones.push(currZone)
            }
        }
    }

    sortWeakestZones(weakZones: Zone[]): void {
        weakZones.sort((a, b) => {
            if (a.enemyPower - a.futurOverringDrones[ID] < b.enemyPower - b.futurOverringDrones[ID]) {
                return -1
            }
            else if (a.enemyPower - a.futurOverringDrones[ID] > b.enemyPower - b.futurOverringDrones[ID]) {
                return 1
            }
            return 0
        })
    }
}

const strategist: Strategist = new Strategist(playerArray, zoneArray)

var inputs: string[] = readline().split(' ');
const P: number = parseInt(inputs[0]); // number of players in the game (2 to 4 players)
const ID: number = parseInt(inputs[1]); // ID of your player (0, 1, 2, or 3)
const D: number = parseInt(inputs[2]); // number of drones in each team (3 to 11)
const Z: number = parseInt(inputs[3]); // number of zones on the map (4 to 8)
for (let i = 0; i < Z; i++) {
    var inputs: string[] = readline().split(' ');
    const X: number = parseInt(inputs[0]); // corresponds to the position of the center of a zone. A zone is a circle with a radius of 100 units.
    const Y: number = parseInt(inputs[1]);

    zoneArray.push(new Zone({x: X, y: Y}, i))
}

for (let i = 0 ; i < P; i++) {
    playerArray.push(new Player(i))

    for (let j = 0; j < D; j++) {
        playerArray[i].droneArray.push(new Drone())
    }
}

// game loop
while (true) {
    for (let i = 0; i < Z; i++) {
        const TID: number = parseInt(readline()); // ID of the team controlling the zone (0, 1, 2, or 3) or -1 if it is not controlled. The zones are given in the same order as in the initialization.

        zoneArray[i].ownership = TID;
        zoneArray[i].setOverringDronesArray(playerArray)
    }
    for (let i = 0; i < P; i++) {
        for (let j = 0; j < D; j++) {
            var inputs: string[] = readline().split(' ');
            const DX: number = parseInt(inputs[0]); // The first D lines contain the coordinates of drones of a player with the ID 0, the following D lines those of the drones of player 1, and thus it continues until the last player.
            const DY: number = parseInt(inputs[1]);

            if (i == ID) {
                playerArray[i].droneArray[j].setIsMoving()
            }

            playerArray[i].droneArray[j].setLastPosition()
            playerArray[i].droneArray[j].setPosition({x: DX, y: DY})
            playerArray[i].droneArray[j].setOnZone(zoneArray)
            playerArray[i].droneArray[j].setId(j)
            playerArray[i].droneArray[j].setTargetZone(zoneArray)
            playerArray[i].droneArray[j].setTimeToTarget(zoneArray)
        }

        playerArray[i].setPointsGain(zoneArray)
    }

    strategist.tactics()

    for (let i = 0; i < D; i++) {
        console.log(playerArray[ID].droneArray[i].destination.x + " " + playerArray[ID].droneArray[i].destination.y);
    }
}
