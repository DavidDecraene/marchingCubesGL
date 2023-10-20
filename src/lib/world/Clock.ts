export interface ClockConfig {
  hoursInDay: number;
  speed: number;
}

export const defaultConfig: ClockConfig = {
  hoursInDay: 24,
  speed: 30
}

export class Clock {
  private running = false;
  public readonly data = {
    year: 0,
    month: 0,
    day: 0,
    hour: 0,
    minute: 0,
    second: 0,
    rest: 0
  }

  public get active(): boolean {
    return this.running;
  }

  public get hoursInDay(): number {
    return this.config.hoursInDay
  }

  public get dayFraction(): number
  {
      const ht = 60 * 60;
      const dt = ht * this.config.hoursInDay;
      const f = this.data.second + (this.data.minute * 60) + (this.data.hour * ht);
      return f / dt;
  }

  constructor(public readonly config: ClockConfig = defaultConfig) {
    // TODO: years and months
  }

  public resume(): void
  {
      this.running = true;
  }

  public pause(): void
  {
      this.running = false;
  }

  private updateDays(add: number): void
  {
      this.data.day += add;

  }

  private updateHours(add: number): void
  {
      this.data.hour += add;
      if (this.data.hour >= this.config.hoursInDay)
      {
          const iRest = this.data.hour % this.config.hoursInDay;
          this.updateDays((this.data.hour - iRest) / this.config.hoursInDay);
          this.data.hour = iRest;
      }
  }

  private updateMinutes(add: number): void
  {
      this.data.minute += add;
      if (this.data.minute >= 60)
      {
          const iRest = this.data.minute % 60;
          this.updateHours((this.data.minute - iRest) / 60);
          this.data.minute = iRest;
      }
  }

  private updateSeconds(add: number): void
  {
      this.data.second += add;
      if (this.data.second >= 60)
      {

          const iRest = this.data.second % 60;
          this.updateMinutes((this.data.second - iRest) / 60);
          this.data.second = iRest;
      }

  }

  public update(deltaTime: number): boolean
  {

      if (!this.running) { return false; }
      this.data.rest += deltaTime * this.config.speed;
      let clockChanged = false;
      const hours = 60 * 60;
      const days = hours *  this.config.hoursInDay;
      if (this.data.rest > days)
      {
          clockChanged = true;
          const rest = this.data.rest % (days);
          this.data.day += Math.floor((this.data.rest - rest) / (days));
          this.data.rest = rest;
      }
      if (this.data.rest > hours)
      {
          clockChanged = true;
          const rest = this.data.rest % (hours);
          this.updateHours(Math.floor((this.data.rest - rest) / (hours)));
          this.data.rest = rest;
      }
      if (this.data.rest > 60)
      {
          clockChanged = true;
          const rest = this.data.rest % 60;
          this.updateMinutes(Math.floor((this.data.rest - rest) / 60));
          this.data.rest = rest;
      }
      if (this.data.rest >= 1)
      {
          clockChanged = true;
          const rest = this.data.rest % 1;
          this.updateSeconds(Math.floor(this.data.rest - rest));
          this.data.rest = rest;
      }
      return clockChanged;
  }

  public toString(): string {
    const sb = new Array<string>();
    if (this.data.year > 0)
    {
        sb.push(this.data.year + '');
        sb.push(this.data.year > 1 ? " years " : "year ");
    }
    if (this.data.month > 0)
    {
        sb.push(this.data.month + '');
        sb.push(this.data.month > 1 ? " months " : "month ");
    }
    if (this.data.day > 0)
    {
        sb.push(this.data.day + '');
        sb.push(this.data.day > 1 ? " days " : "day ");
    }
    if (this.data.hour > 0)
    {
        sb.push(this.data.hour + '');
        sb.push(this.data.hour > 1 ? " hours " : "hour ");
    }
    if (this.data.minute > 0)
    {
        sb.push(this.data.minute + '');
        sb.push(this.data.hour > 1 ? " minutes " : "minute ");
    }
    if (this.data.second > 0)
    {
        sb.push(this.data.second + '');
        sb.push(this.data.second > 1 ? " seconds " : "second ");

    }
    return sb.join('');
  }


}
