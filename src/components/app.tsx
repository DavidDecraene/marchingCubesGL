import React from 'react';
import './App.scss';
import { ClockRender } from './ClockRender';
import { FPSCounter } from './FPSCounter';

export class App extends React.Component {

  public render(): JSX.Element {
    return <>
      <h4 className="title">OpenGl Voxel (Boxel) Experiment</h4>
      <div className="counters">
        <FPSCounter></FPSCounter>
        <ClockRender></ClockRender>
      </div>
      <div className="middle">
        <div className="stage-container">
          <canvas width="1200" height="800" id="canvas"></canvas>
        </div>
      </div>
    </>;
  }

}
