import React from 'react';
import { Subscription } from 'rxjs';
import { Time } from '../lib/data/time/Time';
import { GameManager } from '../lib/world/GameManager';

type Props = {

}

type State = {
  fps: number;
}



export class FPSCounter extends React.Component<Props, State> {
  private sub: Subscription | undefined;

  constructor(props: Props) {
    super(props);
    this.state = {
      fps: 0
    };
  }

  componentDidMount() : void {
    this.sub = GameManager.onLowTick.subscribe(() => {
      const { fps } = this.state;
      if (fps === Time.fps) return;
      this.setState({ fps: Time.fps });
    });
  }

  componentWillUnmount(): void {
    if(this.sub) this.sub.unsubscribe();
  }

  public render(): JSX.Element {
    const { fps } = this.state;
    return <div>
      <label>FPS:</label>
      <span className="ml5">{fps}</span>
    </div>;
  }

}
