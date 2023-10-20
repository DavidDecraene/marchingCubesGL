import { Subject } from "rxjs";
import { Time } from "../data/time/Time";
import { Timer } from "../data/time/Timer";
import { Clock } from "./Clock";
import { World } from "./World";



class GameManagerImpl {
  public clock = new Clock();
  public onMediumTick = new Subject<void>();
  public onLowTick = new Subject<void>();
  private secondTimer = new Timer(1);
  private mediumTimer = new Timer(0.250);

  public setWorld(_world: World) {
    this.clock.data.hour = 6;
    this.clock.resume();
    this.clock.config.speed = 300;

  }

  public update() {
    this.clock.update(Time.deltaTime);
    if (this.mediumTimer.update(Time.deltaTime)) {
      this.onMediumTick.next();
    }
    if (this.secondTimer.update(Time.deltaTime)){
      this.onLowTick.next();
    }

  }

}


export const GameManager = new GameManagerImpl();
