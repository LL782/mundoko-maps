import style from "./scaleMargins.module.css";

export const ScaleMargins = () => (
  <>
    <ol className={`${style.northSouthMargin} ${style.margin}`}>
      <li className={style.marker}>5150</li>
      <li className={style.marker}>5151</li>
      <li className={style.marker}>5152</li>
      <li className={style.marker}>5153</li>
      <li className={style.marker}>5154</li>
      <li className={style.marker}>5155</li>
      <li className={style.marker}>5156</li>
      <li className={style.marker}>5157</li>
      <li className={style.marker}>5158</li>
      <li className={style.marker}>5159</li>
      <li className={style.marker}>5160</li>
    </ol>
    <ol className={`${style.westEastMargin} ${style.margin}`}>
      <li className={style.marker}>5130</li>
      <li className={style.marker}>5131</li>
      <li className={style.marker}>5132</li>
      <li className={style.marker}>5133</li>
      <li className={style.marker}>5134</li>
      <li className={style.marker}>5135</li>
      <li className={style.marker}>5136</li>
      <li className={style.marker}>5137</li>
      <li className={style.marker}>5138</li>
      <li className={style.marker}>5139</li>
      <li className={style.marker}>5140</li>
    </ol>
  </>
);
