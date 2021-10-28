export type Item = {
  /**
   * @param {string} title
   * The title for the slide footer
   */
  title?: string;
  /**
   * @param {string} text
   * The text for the slide footer
   */
  text?: string;
  /**
   * @param {string | number} uri
   * The image path for the slide
   */
  uri: string | number;

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
};

export type SlideDirection = 'even' | 'odd' | 'left' | 'right';

export type ProgressBarDirection = 'fromLeft' | 'fromRight' | 'middle';
