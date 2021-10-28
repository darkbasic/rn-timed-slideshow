import React, { Component } from 'react';
import {
  View,
  FlatList,
  Animated,
  Easing,
  Image,
  TouchableWithoutFeedback,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  ImageStyle,
  LayoutChangeEvent,
  ListRenderItemInfo,
  StyleProp,
} from 'react-native';
import ImageWrapper from './ImageWrapper';
import Styles, { width as windowWidth, EXTRA_WIDTH } from './styles';
import type { SlideDirection, Item, ProgressBarDirection } from './types';

export interface TimedSlideshowProps {
  /**
   * @param {[Item]} items Array of objects representing an item.
   */
  items: [Item];

  /**
   * @param {boolean} loop
   * If true, items will be displayed in loop
   * Default: true
   */
  loop?: boolean;

  /**
   * @param {number} duration
   * The duration in milliseconds of the animation of all the slides
   * Default: 5000
   */
  duration?: number;

  /**
   * @param {number} index
   * The first slide to appear
   * Default: 0
   */
  index: number;

  /**
   * @param {number} extraSpacing
   * The number of pixels the image will show in animation
   * Default: 10% Screen Width
   */
  extraSpacing?: number;

  /**
   * @param {boolean} fullWidth
   * If true, the animation will show the full image
   * Default: false
   */
  fullWidth?: boolean;

  /**
   * @param {string} progressBarColor
   * String to change the progress bar color
   * Default: null
   */
  progressBarColor?: string;

  /**
   * @param {boolean} showProgressBar
   * Flag to show or hide the progress bar
   * Default: true
   */
  showProgressBar?: boolean;

  /**
   * @param {boolean} multipleProgressBars
   * Flag to show a single or multiple progress bars
   * Default: false
   */
  multipleProgressBars?: boolean;

  /**
   * @param {boolean} progressBarsSpacing
   * The margin between each progress bar
   * Default: 12
   */
  progressBarsSpacing?: boolean;

  /**
   * @param {string} progressBarDirection
   * Progress bar animation direction
   * Default: 'middle'
   */
  progressBarDirection?: ProgressBarDirection;

  /**
   * @param {boolean} showFooterContent
   * Flag to show or hide the footer content
   * Default: true
   */
  showFooterContent?: boolean;

  /**
   * @param {string} slideDirection
   * The direction the image animation will go
   * Default: 'even'
   */
  slideDirection?: SlideDirection;

  /**
   * @param {ViewStyle} footerStyle
   * Stylesheet object for the footer main container
   * Default: null
   */
  footerStyle?: ViewStyle;

  /**
   * @param {ViewStyle} progressBarContainerStyle
   * Stylesheet object for the progress bar container
   * Default: null
   */
  progressBarContainerStyle?: ViewStyle;

  /**
   * @param {ViewStyle} progressBarStyle
   * Stylesheet object for the progress bar
   * Default: null
   */
  progressBarStyle?: ViewStyle;

  /**
   * @param {TextStyle} titleStyle
   * Stylesheet object for the footer title
   * Default: null
   */
  titleStyle?: TextStyle;

  /**
   * @param {TextStyle} textStyle
   * Stylesheet object for the footer text
   * Default: null
   */
  textStyle?: TextStyle;

  /**
   * @param {ViewStyle} closeImgWrapperStyle
   * Stylesheet object for the close button img wrapper
   * Default: null
   */
  closeImgWrapperStyle?: TextStyle;

  /**
   * @param {function} renderItem
   * Function that renders each item
   */
  renderItem?: (info: {
    item: Item;
    index: number;
    focusedIndex: number;
  }) => JSX.Element;

  /**
   * @param {function} renderFooter
   * Function that renders the slideshow footer
   */
  renderFooter?: (arg: {
    item: object;
    index: number;
    focusedIndex: number;
    defaultStyle: ViewStyle;
    animation: {
      titleTranslateY: any;
      textTranslateY: any;
      opacity: any;
    };
  }) => JSX.Element;

  /**
   * @param {function} renderIcon
   * Function that renders the slideshow footers icon for next
   */
  renderIcon?: (arg: { snapToNext: Function }) => JSX.Element;

  /**
   * @param {function} renderCloseIcon
   * Function that renders the slideshow close icon
   */
  renderCloseIcon?: (arg: {
    wrapperStyle: ViewStyle;
    imageStyle: ImageStyle;
    onPress: Function;
  }) => JSX.Element;

  /**
   * @param {function} onClose
   * Callback when user clicks the close button
   */
  onClose?: (index?: number) => void;
}

type Props = Omit<
  TimedSlideshowProps,
  keyof typeof TimedSlideshow.defaultProps
> &
  typeof TimedSlideshow.defaultProps;

interface State {
  index: number;
  focusedIndex: number;
  layoutWidth: number;
  loaded: boolean;
  timer: Animated.Value;
}

export default class TimedSlideshow extends Component<Props, State> {
  static defaultProps = {
    items: [] as Item[],
    duration: 5000,
    index: 0,
    extraSpacing: EXTRA_WIDTH,
    fullWidth: false,
    showProgressBar: true,
    multipleProgressBars: false,
    progressBarsSpacing: 12,
    showFooterContent: true,
    slideDirection: 'even' as SlideDirection,
    progressBarDirection: 'middle' as ProgressBarDirection,
    loop: true,
  };

  slideShow?: FlatList<Item>;

  constructor(props: Props) {
    super(props);

    this.state = {
      index: props.index,
      focusedIndex: props.index, // ??
      layoutWidth: windowWidth,
      loaded: false,
      timer: new Animated.Value(0),
    };

    this.snapToNext = this.snapToNext.bind(this);
    this.onLayout = this.onLayout.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.onClose = this.onClose.bind(this);
  }

  componentDidMount() {
    // this.animation();
  }

  animation() {
    const { index } = this.state;
    let { duration, items } = this.props;

    if (items[index]?.duration != null) {
      duration = items[index].duration!;
    }
    return Animated.timing(this.state.timer, {
      toValue: 1,
      easing: Easing.ease,
      useNativeDriver: true,
      duration,
    }).start(({ finished }) => finished && this.snapToNext());
  }

  snapToNext() {
    const { index, timer } = this.state;
    let { items, loop } = this.props;

    let newIndex = (index + 1) % items.length;

    timer.stopAnimation(() => {
      if (!loop && newIndex === 0) {
        // we reached the start again, stop the loop
      } else {
        this.slideShow?.scrollToIndex({ animated: true, index: newIndex });
        this.setState({ timer: new Animated.Value(0), index: newIndex }, () => {
          this.animation();
        });
      }
    });
  }

  onLayout({
    nativeEvent: {
      layout: { width },
    },
  }: LayoutChangeEvent) {
    try {
      this.setState({ layoutWidth: width, loaded: true }, () => {
        this.animation();
      });
    } catch (err) {
      this.setState({ loaded: true }, () => {
        this.animation();
      });
    }
  }

  renderItem({ item, index }: ListRenderItemInfo<Item>) {
    let { duration, extraSpacing, fullWidth, slideDirection, renderItem } =
      this.props;
    const { index: focusedIndex, layoutWidth } = this.state;

    if (typeof renderItem === 'function')
      return renderItem({ item, index, focusedIndex });

    if (item.duration != null) duration = item.duration;

    if (item.extraSpacing != null) extraSpacing = item.extraSpacing;

    if (item.direction != null) slideDirection = item.direction;

    if (item.fullWidth != null) fullWidth = item.fullWidth;

    return (
      <ImageWrapper
        uri={item.uri}
        index={index}
        duration={duration}
        fullWidth={fullWidth}
        focusedIndex={focusedIndex}
        extraSpacing={extraSpacing}
        direction={slideDirection}
        layoutWidth={layoutWidth}
      />
    );
  }

  renderProgressBar() {
    const {
      showProgressBar,
      progressBarDirection,
      progressBarColor,
      items,
      multipleProgressBars,
      progressBarsSpacing,
      showFooterContent,
      progressBarContainerStyle,
      progressBarStyle,
    } = this.props;
    const { layoutWidth, index } = this.state;
    if (!showProgressBar) return null;

    let animation: Animated.AnimatedProps<StyleProp<ViewStyle>> = {
      transform: [{ scaleX: this.state.timer }],
    };

    // Footer container as a width of 100% with paddingHorizontal of 7.5%
    const containerWidth = layoutWidth * 0.85;
    const progressBarWidth = multipleProgressBars
      ? (containerWidth - (items.length - 1) * progressBarsSpacing) /
        items.length
      : containerWidth;

    if (
      progressBarDirection === 'fromLeft' ||
      progressBarDirection === 'fromRight'
    ) {
      let initialValue = progressBarWidth;

      if (progressBarDirection === 'fromLeft') initialValue *= -1;

      const translateX = this.state.timer.interpolate({
        inputRange: [0, 1],
        outputRange: [initialValue, 0],
        extrapolate: 'clamp',
      });

      animation.transform = [{ translateX }];
    }

    if (progressBarColor) animation.backgroundColor = progressBarColor;

    return (
      <View style={{ width: '100%', flexDirection: 'row' }}>
        {items.map(
          (_el, i) =>
            (multipleProgressBars || index === i) && (
              <View
                key={i}
                style={[
                  Styles.progressBarContainer,
                  !showFooterContent && { backgroundColor: 'rgba(0,0,0,0.4)' },
                  { width: progressBarWidth },
                  multipleProgressBars &&
                    i < items.length - 1 && {
                      marginRight: progressBarsSpacing,
                    },
                  progressBarContainerStyle,
                ]}
              >
                {index === i && (
                  <Animated.View
                    style={[
                      Styles.progressBar,
                      { width: progressBarWidth },
                      animation,
                      progressBarStyle,
                    ]}
                  />
                )}
              </View>
            )
        )}
      </View>
    );
  }

  renderIcon() {
    const { renderIcon } = this.props;

    if (typeof renderIcon === 'function')
      return renderIcon({ snapToNext: this.snapToNext });

    return (
      <TouchableWithoutFeedback onPress={this.snapToNext}>
        <Image source={require('./arrow.png')} style={Styles.arrowImg} />
      </TouchableWithoutFeedback>
    );
  }

  onClose() {
    const { onClose } = this.props;
    const { index } = this.state;
    if (typeof onClose === 'function') onClose(index);
  }

  renderCloseIcon() {
    const { renderCloseIcon, closeImgWrapperStyle } = this.props;
    if (typeof renderCloseIcon === 'function')
      return renderCloseIcon({
        wrapperStyle: Styles.closeImgWrapper,
        imageStyle: Styles.closeImg,
        onPress: this.onClose,
      });

    return (
      <TouchableWithoutFeedback onPress={this.onClose}>
        <View style={[Styles.closeImgWrapper, closeImgWrapperStyle]}>
          <Image source={require('./close.png')} style={Styles.closeImg} />
        </View>
      </TouchableWithoutFeedback>
    );
  }

  renderFooterContent() {
    const {
      items,
      renderFooter,
      loop,
      titleStyle = {},
      textStyle = {},
    } = this.props;
    const { index, timer, focusedIndex } = this.state;

    const item = items[index];

    const titleTranslateY = timer.interpolate({
      inputRange: [0, 0.05],
      outputRange: [100, 0],
      extrapolate: 'clamp',
    });

    const textTranslateY = timer.interpolate({
      inputRange: [0, 0.06],
      outputRange: [100, 0],
      extrapolate: 'clamp',
    });

    let opacity: Animated.AnimatedInterpolation | null = timer.interpolate({
      inputRange: [0.9, 0.95],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    const animation = { titleTranslateY, textTranslateY, opacity };

    if (typeof renderFooter === 'function')
      return renderFooter({
        item,
        index,
        focusedIndex,
        defaultStyle: Styles.footerContentContainer,
        animation,
      });

    if (!loop) opacity = null;
    return (
      <View style={Styles.footerContentContainer}>
        <View style={{ flex: 1 }}>
          <View style={{ overflow: 'hidden' }}>
            <Animated.Text
              numberOfLines={1}
              style={[
                Styles.footerTitle,
                titleStyle,
                { opacity, transform: [{ translateY: titleTranslateY }] },
              ]}
            >
              {item.title}
            </Animated.Text>
          </View>

          <View style={{ overflow: 'hidden' }}>
            <Animated.Text
              numberOfLines={2}
              style={[
                Styles.footerText,
                textStyle,
                { opacity, transform: [{ translateY: textTranslateY }] },
              ]}
            >
              {item.text}
            </Animated.Text>
          </View>
        </View>
        <View style={{ height: '100%', justifyContent: 'center' }}>
          {this.renderIcon()}
        </View>
      </View>
    );
  }

  renderFooter() {
    const { footerStyle, showFooterContent } = this.props;
    return (
      <View
        style={[
          Styles.footerContainer,
          !showFooterContent && {
            height: 'auto',
            backgroundColor: 'transparent',
          },
          footerStyle,
        ]}
      >
        {this.renderProgressBar()}
        {showFooterContent && this.renderFooterContent()}
      </View>
    );
  }

  renderContent() {
    const { items, index } = this.props;
    const { layoutWidth, loaded } = this.state;

    if (!loaded)
      return (
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size="large" animating color="red" />
        </View>
      );

    return (
      <View style={{ flex: 1 }}>
        <FlatList
          ref={(slideShow) => {
            if (slideShow) {
              this.slideShow = slideShow;
            }
          }}
          style={{ flex: 1 }}
          data={items}
          extraData={this.state}
          renderItem={this.renderItem}
          initialScrollIndex={index}
          horizontal
          pagingEnabled
          scrollEnabled={false}
          getItemLayout={(_item, index) => ({
            index,
            length: layoutWidth,
            offset: layoutWidth * index,
          })}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_item, index) => `slide_item_${index}`}
        />
        {this.renderCloseIcon()}
        {this.renderFooter()}
      </View>
    );
  }

  render() {
    return (
      <View style={Styles.root} onLayout={this.onLayout}>
        {this.renderContent()}
      </View>
    );
  }
}
