import * as React from 'react';

import { StyleSheet } from 'react-native';
import { TimedSlideshow } from 'rn-timed-slideshow';

export default function App() {
  const items = [
    {
      uri: 'http://www.lovethemountains.co.uk/wp-content/uploads/2017/05/New-Outdoor-Sports-and-Music-Festival-For-Wales-4.jpg',
      title: 'Michael Malik',
      text: 'Minnesota, USA',
    },
    {
      uri: 'http://blog.adrenaline-hunter.com/wp-content/uploads/2018/05/bungee-jumping-barcelona-1680x980.jpg',
      title: 'Victor Fallon',
      text: 'Val di Sole, Italy',
      duration: 3000,
    },
    {
      uri: 'https://greatist.com/sites/default/files/Running_Mountain.jpg',
      title: 'Mary Gomes',
      text: 'Alps',
      fullWidth: true,
    },
  ];

  return (
    <TimedSlideshow
      items={items}
      progressBarDirection="fromLeft"
      multipleProgressBars={true}
      showFooterContent={false}
      footerStyle={{top: 0, paddingVertical: 16}}
      progressBarContainerStyle={{height: 6, borderRadius: 6 / 2}}
      progressBarStyle={{height: 6, borderRadius: 6 / 2}}
      closeImgWrapperStyle={{top: 50}}
    />
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
