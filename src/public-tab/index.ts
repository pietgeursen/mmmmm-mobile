/**
 * MMMMM is a mobile app for Secure Scuttlebutt networks
 *
 * Copyright (C) 2017 Andre 'Staltz' Medeiros
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import xs, {Stream, Listener} from 'xstream';
import {ReactElement} from 'react';
import {ScreenSource} from '@cycle/native-screen';
import {StateSource, Reducer} from 'cycle-onionify';
import {SSBSource} from '../drivers/ssb';
import intent from './intent';
import view from './view';
import {Content, PostContent} from '../types';

export type Sources = {
  screen: ScreenSource;
  onion: StateSource<any>;
  ssb: SSBSource;
};

export type Sinks = {
  screen: Stream<ReactElement<any>>;
  onion: Stream<Reducer<any>>;
  ssb: Stream<any>;
};

function prepareForSSB(publishMsg$: Stream<string>): Stream<Content> {
  return publishMsg$.map(text => {
    return {
      text,
      type: 'post',
      mentions: []
    } as PostContent;
  });
}

export function publicTab(sources: Sources): Sinks {
  const actions = intent(sources.screen);
  const vdom$ = view(sources.ssb.feed);
  const newContent$ = prepareForSSB(actions.publishMsg);
  const reducer$ = xs.empty();

  return {
    screen: vdom$,
    onion: reducer$,
    ssb: newContent$
  };
}