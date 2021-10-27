import React, { Component } from 'react';
import { View, Image, Animated, Easing } from 'react-native';
import Styles, { width, height, EXTRA_WIDTH } from './styles';
import type { SlideDirection } from './types';

export interface ImageWrapperProps {
  /**
   * @param {string | number} uri
   * The image path for the slide
   */
  uri: string | number;

  /**
   * @param {number} index
   * The slide index
   */
  index: number;

  /**
   * @param {number} focusedIndex
   * The focused index on the Timed-Slideshow component. If you are using the component
   * out of the timed-slideshow you should map the current focused slide index
   */
  focusedIndex: number;

  /**
   * @param {number} duration
   * The duration in milliseconds of the animation
   */
  duration?: number;

  /**
   * @param {number} extraSpacing
   * The number of pixels the image will show in animation
   */
  extraSpacing?: number;

  /**
   * @param {boolean} fullWidth
   * If true, the animation will show the full image
   */
  fullWidth?: boolean;

  /**
   * @param {string} direction
   * The direction the image animation will go
   */
  direction?: SlideDirection;

  /**
   * @param {number} layoutWidth
   * Default value is window with, and when used in Timed-Slideshow component, it uses
   * the containers width
   */
  layoutWidth?: number;
}

type Props = Omit<ImageWrapperProps, keyof typeof ImageWrapper.defaultProps> &
  typeof ImageWrapper.defaultProps;

interface State {
  maxWidth: number;
  imgWidth: number;
  translateX: Animated.Value;
}

export default class ImageWrapper extends Component<Props, State> {
  static defaultProps = {
    index: 0,
    duration: 5000,
    focusedIndex: 0,
    fullWidth: false,
    direction: 'even' as SlideDirection,
    extraSpacing: EXTRA_WIDTH,
    layoutWidth: width,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      maxWidth: -1,
      imgWidth: props.extraSpacing + props.layoutWidth,
      translateX: new Animated.Value(0),
    };
  }

  componentDidMount() {
    if (this.props.focusedIndex === this.props.index) {
      this.startAnimation();
    }

    //moved from componentWillMount here to fix future deprecation issue
    const { uri } = this.props;
    if (typeof uri === 'string') {
      Image.getSize(
        uri,
        (imgWidth, imgHeight) => {
          try {
            let maxWidth = (imgWidth * height) / imgHeight;
            this.setState({ maxWidth });
          } catch (err) {}
        },
        () => console.error('Cannot get image size')
      );
    }
  }

  //componentWillReceiveProps will be deprecated
  shouldComponentUpdate(nextProps: Readonly<Props>) {
    if (nextProps.focusedIndex === nextProps.index) {
      this.state.translateX.stopAnimation(() => {
        this.startAnimation();
      });
      return false;
    } else {
      return true;
    }
  }

  // true -> left to right
  // false -> right to left
  getDirection() {
    const { index, direction } = this.props;

    switch (direction) {
      case 'left':
        return true;
      case 'right':
        return false;
      case 'odd':
        return (index + 1) % 2;
      default:
        return index % 2;
    }
  }

  getExtraSpacing() {
    const { maxWidth } = this.state;
    const { extraSpacing, fullWidth, layoutWidth } = this.props;

    if (maxWidth === -1) return extraSpacing;

    let fullExtraSpacing = this.state.maxWidth - layoutWidth;

    if (fullWidth || extraSpacing > fullExtraSpacing) return fullExtraSpacing;

    return extraSpacing;
  }

  startAnimation() {
    const { duration } = this.props;

    let extraSpacing = Math.floor(this.getExtraSpacing());

    if (this.getDirection()) extraSpacing *= -1;

    Animated.timing(this.state.translateX, {
      toValue: -extraSpacing,
      easing: Easing.ease,
      useNativeDriver: true,
      duration: duration * 1.1,
    }).start(() => {
      this.setState({ translateX: new Animated.Value(0) });
    });
  }

  render() {
    const { uri, layoutWidth } = this.props;
    const { translateX } = this.state;

    const imgWidth = layoutWidth + this.getExtraSpacing();
    const direction = this.getDirection() ? 'flex-end' : 'flex-start';

    return (
      <View style={[Styles.itemContainer, { width: layoutWidth }]}>
        <Animated.Image
          style={[
            Styles.image,
            {
              alignSelf: direction,
              width: imgWidth,
              transform: [{ translateX }],
            },
          ]}
          source={typeof uri === 'string' ? { uri } : uri}
          resizeMethod="resize"
        />
      </View>
    );
  }
}
