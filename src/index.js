// core
import React, { PropTypes, PureComponent } from 'react';
import { View, Image } from 'react-native';
// libs
import Svg, { Rect, Path } from 'react-native-svg';
import genMatrix from './genMatrix';

/**
 * A simple component for displaying QR Code using svg
 */
export default class QRCode extends PureComponent {
  static propTypes = {
    /* what the qr code stands for */
    value: PropTypes.string,
    /* the whole component size */
    size: PropTypes.number,
    /* the color of the cell */
    color: PropTypes.string,
    /* the color of the background */
    backgroundColor: PropTypes.string,
    /* an image source object. example {uri: 'base64string'} or {require('pathToImage')} */
    logo: Image.propTypes.source,
    /* logo width in pixels */
    logoSize: PropTypes.number,
    /* the logo gets a filled rectangular background with this color. Use 'transparent'
         if your logo already has its own backdrop. Default = same as backgroundColor */
    logoBackgroundColor: PropTypes.string,
    /* logo's distance to its wrapper */
    logoMargin: PropTypes.number,
  };
  static defaultProps = {
    value: 'This is a QR Code.',
    size: 100,
    color: 'black',
    backgroundColor: 'white',
    logoMargin: 2,
  };
  constructor(props) {
    super(props);
    this._matrix = null;
    this._cellSize = null;
    this._path = null;
    this.setMatrix(props);
  }
  componentWillUpdate(nextProps) {
    // if value has changed, re-setMatrix
    if (nextProps.value !== this.props.value) {
      this.setMatrix(nextProps);
    }
  }
  /* calculate the size of the cell and draw the path */
  setMatrix(props) {
    const { value, size } = props;
    this._matrix = genMatrix(value);
    this._cellSize = size / (this._matrix.length + 2);
    this._path = this.transformMatrixIntoPath();
  }
  /* project the matrix into path draw */
  transformMatrixIntoPath() {
    const matrix = this._matrix;
    const cellSize = this._cellSize;
    // adjust origin
    const oY = cellSize * 1.5;
    const oX = cellSize;
    let d = '';
    matrix.forEach((row, i) => {
      let needDraw = false;
      row.forEach((column, j) => {
        if (column) {
          if (!needDraw) {
            d += `M${oX + cellSize * j} ${oY + cellSize * i} `;
            needDraw = true;
          }
          if (needDraw && j === matrix.length - 1) {
            d += `L${oX + cellSize * (j + 1)} ${oY + cellSize * i} `;
          }
        } else {
          if (needDraw) {
            d += `L${oX + cellSize * j} ${oY + cellSize * i} `;
            needDraw = false;
          }
        }
      });
    });
    return d;
  }
  renderLogo() {
    const {
      size,
      backgroundColor,
      logo,
      logoBackgroundColor = backgroundColor,
      logoSize = size * 0.2,
      logoMargin,
    } = this.props;
    const wrapSize = logoSize + logoMargin * 2;
    const position = size / 2 - logoSize / 2 - logoMargin;

    return (
      <View
        style={{
          backgroundColor: logoBackgroundColor, 
          width: wrapSize,
          height: wrapSize,
          position: 'absolute',
          left: position,
          top: position,
        }}
      >
        <Image
          style={{
            width: logoSize,
            height: logoSize,
            position: 'absolute',
            left: logoMargin,
            top: logoMargin
          }}
          source={logo}
          resizeMode='contain'
        />
      </View>
    )
  }

  render() {
    const { size, color, backgroundColor, logo } = this.props;

    return (
      <View>
        <Svg width={size} height={size}>
          <Rect
            x={this._cellSize}
            y={this._cellSize}
            width={size - 2 * this._cellSize}
            height={size - 2 * this._cellSize}
            fill={backgroundColor}
          />
          <Path
            d={this._path}
            stroke={color}
            strokeWidth={this._cellSize}
          />
        </Svg>
        {logo && this.renderLogo()}
      </View>
    );
  }
}
