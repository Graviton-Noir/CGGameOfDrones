
type Point = {
    x: number;
    y: number;
};

class Vector2D {
    p1: Point
    p2: Point

    constructor(p1: Point, p2: Point) {
        this.p1 = {x: p1.x, y: p1.y};
        this.p2 = {x: p2.x, y: p2.y};
    }

    length(): number {
        return Math.sqrt(Math.pow(this.p1.x + this.p2.x, 2) + Math.pow(this.p1.y + this.p2.y, 2))
    }

    normalize(): void {

    }
}

function vector2DLength(p1: Point, p2: Point): number {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
}

class Zone {
    id: number
    position: Point
    ownership: number

    overringDrones: number[] = []
    futurOverringDrones: number[] = []
    enemyPower: number

    constructor(p: Point, id: number) {
        this.position = {x: p.x, y: p.y}
        this.id = id

        this.ownership = -1
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
}
let zoneArray: Zone[] = []
const zoneWidth: number = 100

class Drone {
    position: Point
    destination: Point
    destinationZone : number
    id : number

    onZone : number
    isMoving : boolean

    constructor() {
        this.position = {x: 0, y: 0}
        this.destination = {x: 0, y: 0}
        this.onZone = -1
        this.isMoving = false
        this.destinationZone = -1
        this.id = -1
    }

    setPosition(p: Point) {
        this.position = {x: p.x, y: p.y}
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
}

class Player {
    id: number

    droneArray: Drone[] = []

    constructor(id: number) {
        this.id = id;
    }
}
let playerArray: Player[] = []

class Strategist {

    ptrPlayerArray: Player[]
    ptrZoneArray: Zone[]

    constructor(playerArray: Player[], zoneArray: Zone[]) {
        this.ptrPlayerArray = playerArray
        this.ptrZoneArray = zoneArray
    }

    tactics() {

        let droneHasMoved: boolean[] = Array(D).fill(false)

        for (let i = 0; i < D; i++) {
            let currDrone = this.ptrPlayerArray[ID].droneArray[i]

            if (currDrone.isMoving) {
                droneHasMoved[i] = true
            }
        }

        this.tacticLeaveToReinforce(droneHasMoved)
        this.tacticRushClosest(droneHasMoved)

        /* Debug purpose */
        for (let i = 0; i < D; i++) {
            if (droneHasMoved[i] == false) {
                console.error("Warning: drone " + i + " has not moved !")
            }
        }
    }

    tacticRushClosest(droneHasMoved: boolean[]) {

        for (let i = 0; i < D; i++) {
            let currDrone = this.ptrPlayerArray[ID].droneArray[i]
            let closest = 9999
            let zoneMem = 0

            if (droneHasMoved[i] == true)
                continue

            for (let j = 0; j < Z; j++) {
                let currZone = this.ptrZoneArray[j]
                let currDistance = vector2DLength(currDrone.position, currZone.position)

                if (currDistance < closest) {
                    closest = currDistance
                    zoneMem = j
                }
            }

            if (currDrone.position.x != this.ptrZoneArray[zoneMem].position.x ||
                currDrone.position.y != this.ptrZoneArray[zoneMem].position.y )
            {  
                droneHasMoved[i] = true
            }

            currDrone.setDestination(this.ptrZoneArray[zoneMem].position)
            currDrone.destinationZone = zoneMem
            this.ptrZoneArray[zoneMem].futurOverringDrones[ID]++
        }
    }

    tacticLeaveToReinforce(droneHasMoved: boolean[]) {

        let availableDrones: Drone[] = []
        let weakZones: Zone[] = []

        let doesZoneNeedSupport: boolean = false

        // Compter tous ceux qui sont en trop sur une planete : donne une premiere force de frappe
        // Si aucune planete n'est renforçable de cette maniere, prendre en plus celle qui sont perdu
        // Trouve la planete la plus faible à attaquer
        // balancer tous ceux qui sont mobilisable

        for (let i = 0; i < D; i++) {
            let currDrone = this.ptrPlayerArray[ID].droneArray[i]

            console.error(currDrone.onZone)

            if (currDrone.onZone != -1)
            {
                //console.error(currDrone.onZone + " " + this.ptrZoneArray[currDrone.onZone].futurOverringDrones[ID] + " " + this.ptrZoneArray[currDrone.onZone].enemyPower)

                /* If the zone if owned, having the same amount of drone with the enemy shouldn't change the ownership */
                if (this.ptrZoneArray[currDrone.onZone].ownership == ID && this.ptrZoneArray[currDrone.onZone].futurOverringDrones[ID] > this.ptrZoneArray[currDrone.onZone].enemyPower)
                {
                    availableDrones.push(currDrone)
                }
                else if (this.ptrZoneArray[currDrone.onZone].ownership == -1 && this.ptrZoneArray[currDrone.onZone].futurOverringDrones[ID] == this.ptrZoneArray[currDrone.onZone].enemyPower)
                {
                    availableDrones.push(currDrone)
                }
                else if (this.ptrZoneArray[currDrone.onZone].futurOverringDrones[ID] - 1 > this.ptrZoneArray[currDrone.onZone].enemyPower)
                {
                    availableDrones.push(currDrone)
                    //console.error(this.ptrZoneArray[currDrone.onZone].futurOverringDrones[ID] + " " + this.ptrZoneArray[currDrone.onZone].enemyPower)
                }
                else if (this.ptrZoneArray[currDrone.onZone].enemyPower > Z / 2) {
                    availableDrones.push(currDrone)
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
                    }
                }
            }
        }

        for (let j = 0; j < Z; j++) {
            let currZone = this.ptrZoneArray[j]
            if (currZone.ownership != ID) {
                weakZones.push(currZone)
            }
        }

        doesZoneNeedSupport = (weakZones.length > 0)

        if (doesZoneNeedSupport) {

            weakZones.sort((a, b) => {
                if (a.enemyPower - a.futurOverringDrones[ID] < b.enemyPower - b.futurOverringDrones[ID]) {
                    return -1
                }
                else if (a.enemyPower - a.futurOverringDrones[ID] > b.enemyPower - b.futurOverringDrones[ID]) {
                    return 1
                }
                return 0
            })

            for (let i = 0; i < weakZones.length; i++) {

                let nbDroneToSend: number = weakZones[i].futurOverringDrones[ID] + availableDrones.length - weakZones[i].enemyPower

                availableDrones.sort((a, b) => {
                    let distA : number = vector2DLength(a.position, weakZones[i].position)
                    let distB : number = vector2DLength(b.position, weakZones[i].position)

                    if (distA < distB) {
                        return -1
                    }
                    else if (distA > distB) {
                        return 1
                    }
                    return 0
                })

                console.error(weakZones[i].futurOverringDrones[ID] + "(" + weakZones[i].id +  ")" +
                    " + " + 
                    availableDrones.length +
                    " - " + 
                    weakZones[i].enemyPower +
                    " : " + nbDroneToSend)

                if (nbDroneToSend > 0) {
                    for (let j = 0; j < availableDrones.length && j < nbDroneToSend; j++) {

                        availableDrones[j].setDestination(weakZones[i].position)
                        availableDrones[j].destinationZone = weakZones[i].id
                        weakZones[i].futurOverringDrones[ID]++
                        console.error("sent : " + availableDrones[j].id + " to : " + weakZones[i].id)
                        droneHasMoved[j] = true

                        this.ptrZoneArray[availableDrones[j].onZone].futurOverringDrones[ID]--

                        availableDrones.splice(j, 1)
                    }
                }
            }
        }
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
            playerArray[i].droneArray[j].setPosition({x: DX, y: DY})
            playerArray[i].droneArray[j].setOnZone(zoneArray)
            playerArray[i].droneArray[j].setId(j)
        }
    }

    strategist.tactics()

    for (let i = 0; i < D; i++) {
        console.log(playerArray[ID].droneArray[i].destination.x + " " + playerArray[ID].droneArray[i].destination.y);
    }
}
