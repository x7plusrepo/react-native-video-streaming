import React from 'react'
import Svg, {Circle, Defs, G, LinearGradient, Path, Rect, Stop,} from 'react-native-svg'

const SvgGp = props => (
    <Svg viewBox="0 0 21 15" width={21} height={15} {...props}>
        <Defs>
            <LinearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="GP_svg__a">
                <Stop stopColor="#FFF" offset="0%" />
                <Stop stopColor="#F0F0F0" offset="100%" />
            </LinearGradient>
            <LinearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="GP_svg__b">
                <Stop stopColor="#25A057" offset="0%" />
                <Stop stopColor="#1C8245" offset="100%" />
            </LinearGradient>
            <LinearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="GP_svg__c">
                <Stop stopColor="#31B8F4" offset="0%" />
                <Stop stopColor="#1EA2DC" offset="100%" />
            </LinearGradient>
            <LinearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="GP_svg__d">
                <Stop stopColor="#FFE149" offset="0%" />
                <Stop stopColor="#FFDD32" offset="100%" />
            </LinearGradient>
        </Defs>
        <G fill="none" fillRule="evenodd">
            <Path fill="url(#GP_svg__a)" d="M0 0h21v15H0z" />
            <G transform="translate(6 .8)">
                <G transform="translate(0 2.202)">
                    <Rect
                        fill="url(#GP_svg__b)"
                        x={2}
                        width={5}
                        height={5}
                        rx={0.25}
                    />
                    <Path
                        d="M2 .241C2 .108 2.115 0 2.25 0h3.5c.138 0 .194.094.125.21L4.538 2.462l-2.356.356-.161 1.932c-.012.138-.021.146-.021.009V.24z"
                        fill="url(#GP_svg__c)"
                    />
                    <Circle fill="url(#GP_svg__d)" cx={2} cy={2} r={1.5} />
                </G>
                <Rect
                    fill="url(#GP_svg__d)"
                    x={2}
                    y={10.202}
                    width={5}
                    height={1}
                    rx={0.25}
                />
                <Path
                    d="M2.14 8.152h.02c.04 0 .07.038.07.088v.246c0 .039.021.073.074.073h.06c.005 0 .01 0 .01-.003 0-.004-.004-.008-.008-.013l-.037-.039c-.006-.005-.01-.012-.01-.02v-.24a.142.142 0 0 0-.073-.127c.04-.025.084-.077.084-.204 0-.148-.061-.211-.18-.211h-.143c-.005 0-.007.003-.007.007 0 .003.006.007.008.01l.034.033c.008.008.01.019.01.032v.693c0 .014-.002.024-.01.032l-.034.033c-.002.003-.008.007-.008.01 0 .004.002.007.007.007h.18c.004 0 .006-.003.006-.007 0-.003-.006-.007-.008-.01l-.034-.033c-.008-.008-.01-.018-.01-.032v-.325zm0-.393h.018c.056 0 .079.038.079.154 0 .138-.023.182-.08.182h-.016V7.76zm.39 0h.064c.015 0 .025.007.03.022l.062.215c0 .004.004.008.009.008.003 0 .006-.003.006-.007v-.285c0-.005-.005-.01-.01-.01h-.296c-.004 0-.006.003-.006.007 0 .003.005.007.008.01l.034.033c.008.008.01.019.01.032v.693c0 .014-.002.024-.01.032l-.034.033c-.003.005-.008.007-.008.01 0 .004.002.007.006.007h.296c.006 0 .01-.004.01-.01v-.287c0-.003-.003-.007-.006-.007-.004 0-.007.002-.008.007l-.062.22c-.004.013-.016.02-.03.02h-.066v-.347h.025c.006 0 .01.002.013.008l.039.083c.002.005.003.008.008.008.003 0 .004-.002.004-.006v-.242c0-.005 0-.007-.004-.007s-.005.002-.007.007l-.04.08c-.002.006-.007.008-.013.008H2.53v-.335zm.44.591c0 .109-.026.152-.061.152-.042 0-.055-.064-.055-.393 0-.241.013-.35.061-.35.05 0 .1.148.124.233.002.007.006.012.01.012s.006-.004.006-.008V7.72c0-.011-.002-.019-.008-.019s-.013.006-.023.015c-.011.01-.023.018-.029.018a.036.036 0 0 1-.017-.007.11.11 0 0 0-.072-.026c-.14 0-.146.265-.146.406 0 .19.006.451.149.451.025 0 .048-.014.072-.035.004-.004.008-.005.011-.005.005 0 .007.001.011.005l.035.03a.017.017 0 0 0 .011.005c.004 0 .006-.002.006-.006v-.358c0-.012.003-.02.011-.026l.033-.027c.004-.005.006-.007.006-.011 0-.005-.003-.007-.008-.007h-.169c-.006 0-.01.002-.01.007 0 .004.002.006.007.011l.032.027c.008.007.012.014.012.026v.155zm.201.127c0 .014-.002.024-.01.032l-.034.033c-.002.003-.008.007-.008.01 0 .004.002.007.007.007h.18c.004 0 .006-.003.006-.007 0-.003-.006-.007-.008-.01l-.034-.033c-.008-.008-.01-.018-.01-.032v-.693c0-.013.002-.024.01-.032l.034-.033c.002-.003.008-.007.008-.01 0-.004-.002-.007-.007-.007h-.18c-.004 0-.006.003-.006.007 0 .003.006.007.008.01l.034.033c.008.008.01.019.01.032v.693zm.339-.775c-.137 0-.152.241-.152.406 0 .216.015.451.152.451.138 0 .153-.235.153-.451 0-.165-.015-.406-.153-.406zm0 .057c.034 0 .06.096.06.35 0 .297-.026.393-.06.393-.033 0-.059-.096-.059-.393 0-.254.026-.35.059-.35zm.245.718a.049.049 0 0 1-.01.032l-.028.033c-.003.003-.008.007-.008.011 0 .003.002.006.006.006h.151c.005 0 .007-.003.007-.006 0-.004-.004-.008-.008-.011l-.03-.034c-.009-.008-.012-.017-.012-.031v-.57h.002l.134.624c.003.017.012.028.023.028h.048c.008 0 .011-.004.011-.012v-.763c0-.013.004-.023.01-.032l.029-.033c.003-.003.008-.007.008-.011 0-.003-.002-.006-.007-.006h-.15c-.005 0-.008.003-.008.006 0 .004.006.008.008.011l.032.034c.008.008.01.018.01.031v.429h-.002l-.105-.492c-.002-.011-.005-.019-.013-.019h-.138c-.004 0-.006.003-.006.006 0 .004.005.008.008.011l.028.033c.007.01.01.019.01.032v.693zM2.227 9.493c0 .108-.025.152-.06.152-.041 0-.055-.064-.055-.393 0-.241.014-.35.062-.35.05 0 .1.147.123.233.002.007.006.012.01.012s.006-.004.006-.008v-.275c0-.011-.002-.02-.008-.02s-.012.007-.023.016c-.011.01-.023.018-.028.018a.036.036 0 0 1-.017-.007.11.11 0 0 0-.072-.026c-.141 0-.147.265-.147.406 0 .19.006.451.149.451.025 0 .048-.014.072-.035.004-.004.008-.005.011-.005.005 0 .007.001.012.005l.034.03a.017.017 0 0 0 .011.005c.004 0 .006-.002.006-.006v-.359c0-.011.004-.019.012-.025l.033-.027c.003-.005.005-.007.005-.012 0-.004-.003-.006-.008-.006h-.169c-.005 0-.009.002-.009.006 0 .005.001.007.006.012l.032.027c.008.007.012.014.012.025v.156zm.191.086c0 .07.047.123.137.123.078 0 .133-.053.133-.123v-.652a.05.05 0 0 1 .01-.032l.035-.033c.003-.003.005-.007.005-.01 0-.004-.002-.007-.007-.007h-.156c-.005 0-.007.003-.007.007 0 .003.002.007.006.01l.035.033c.007.007.01.018.01.032v.622c0 .05-.012.096-.054.096-.054 0-.059-.046-.059-.096v-.622a.05.05 0 0 1 .01-.032l.035-.033c.003-.003.006-.007.006-.01 0-.004-.003-.007-.007-.007h-.175c-.005 0-.007.003-.007.007 0 .003.002.007.006.01l.035.033c.007.007.01.018.01.032v.652zm.567.052c.001.01-.001.018-.006.023l-.03.03c-.004.004-.008.008-.008.011 0 .004.002.007.008.007h.164c.006 0 .008-.003.008-.007 0-.003-.003-.007-.007-.01l-.033-.03c-.008-.007-.011-.02-.012-.03l-.109-.768c-.001-.006-.005-.012-.01-.012h-.043c-.005 0-.008.004-.009.01l-.104.768c0 .01-.002.022-.009.029l-.032.032c-.003.003-.008.008-.008.011 0 .004.002.007.007.007h.131c.006 0 .008-.003.008-.007 0-.003-.006-.008-.011-.014l-.025-.026a.026.026 0 0 1-.006-.02l.017-.126c.001-.005.004-.008.007-.008h.085c.005 0 .009.004.01.01l.017.12zm-.105-.19c-.002 0-.005-.003-.003-.008l.037-.28h.003l.04.28c0 .004-.002.007-.005.007H2.88zm.31.179c0 .013-.003.024-.01.032l-.035.033c-.002.004-.008.007-.008.01 0 .004.002.007.007.007h.15c.116 0 .185-.078.185-.45 0-.296-.069-.407-.184-.407h-.151c-.005 0-.007.003-.007.007 0 .003.006.007.008.01l.034.033c.008.008.01.018.01.032v.693zm.088-.718h.02c.045 0 .087.043.087.35 0 .35-.042.393-.087.393h-.02v-.743zm.387 0h.065c.015 0 .025.007.03.022l.062.215c0 .004.004.008.009.008.003 0 .006-.003.006-.007v-.285c0-.006-.005-.01-.01-.01h-.296c-.004 0-.006.003-.006.007 0 .003.005.007.008.01l.034.033c.008.008.01.018.01.032v.693c0 .013-.002.024-.01.032l-.034.033c-.003.004-.008.007-.008.01 0 .004.002.007.006.007h.296c.006 0 .01-.005.01-.01v-.287c0-.004-.003-.007-.006-.007-.004 0-.007.002-.008.007l-.062.22c-.004.013-.016.02-.03.02h-.066v-.348h.025c.006 0 .01.003.013.008l.039.084c.002.004.003.008.008.008.003 0 .004-.002.004-.006V9.15c0-.005 0-.007-.004-.007s-.005.002-.007.007l-.04.08c-.002.006-.007.008-.013.008h-.025v-.335zm.265.718c0 .013-.002.024-.01.032l-.034.033c-.003.004-.008.007-.008.01 0 .004.002.007.007.007h.28c.009 0 .012-.006.012-.016v-.28c0-.005-.002-.008-.006-.008s-.004.003-.006.008l-.071.222c-.005.013-.016.017-.03.017h-.046v-.718c0-.014.003-.024.01-.032l.035-.033c.002-.003.008-.007.008-.01 0-.004-.002-.007-.007-.007h-.18c-.004 0-.006.003-.006.007 0 .003.005.007.008.01l.034.033c.008.008.01.018.01.032v.693zm.459-.775c-.138 0-.152.241-.152.406 0 .216.014.451.152.451.138 0 .153-.235.153-.451 0-.165-.015-.406-.153-.406zm0 .057c.034 0 .059.096.059.35 0 .297-.025.393-.06.393-.033 0-.058-.096-.058-.393 0-.254.025-.35.059-.35zm.24.677c0 .07.046.123.137.123.077 0 .132-.053.132-.123v-.652a.05.05 0 0 1 .01-.032l.035-.033c.003-.003.006-.007.006-.01 0-.004-.003-.007-.007-.007h-.157c-.004 0-.007.003-.007.007 0 .003.003.007.006.01l.035.033c.007.007.01.018.01.032v.622c0 .05-.012.096-.054.096-.054 0-.058-.046-.058-.096v-.622a.05.05 0 0 1 .009-.032l.035-.033c.004-.003.006-.007.006-.01 0-.004-.002-.007-.007-.007h-.175c-.004 0-.007.003-.007.007 0 .003.003.007.006.01l.035.033c.007.007.01.018.01.032v.652zm.39.04c0 .014-.002.025-.01.033l-.034.033c-.002.004-.008.007-.008.01 0 .004.002.007.007.007h.187c.005 0 .007-.003.007-.007 0-.003-.005-.007-.008-.01l-.042-.033c-.01-.007-.01-.019-.01-.032v-.317h.038c.103 0 .151-.089.151-.236 0-.175-.062-.222-.15-.222h-.173c-.005 0-.007.003-.007.007 0 .003.006.007.008.01l.034.033c.008.008.01.018.01.032v.693zm.088-.717h.034c.048 0 .062.038.062.165 0 .126-.014.179-.062.179h-.034v-.344zm.372 0h.065c.015 0 .025.007.03.022l.061.215c.002.004.005.008.01.008.003 0 .005-.003.005-.007v-.285c0-.006-.004-.01-.009-.01h-.296c-.004 0-.007.003-.007.007 0 .003.006.007.008.01l.035.033c.008.008.01.018.01.032v.693c0 .013-.002.024-.01.032l-.035.033c-.002.004-.008.007-.008.01 0 .004.003.007.007.007h.296c.006 0 .01-.005.01-.01v-.287c0-.004-.003-.007-.006-.007-.004 0-.007.002-.008.007l-.062.22c-.005.013-.016.02-.031.02h-.065v-.348h.025c.006 0 .01.003.013.008l.038.084c.003.004.004.008.008.008s.005-.002.005-.006V9.15c0-.005-.001-.007-.005-.007-.003 0-.004.002-.006.007l-.04.08c-.003.006-.007.008-.013.008h-.025v-.335z"
                    fill="#000"
                />
                <Path
                    d="M6.974.783C8.35.367 8.762.294 8.954.901A1 1 0 0 1 8.3 2.156a8.466 8.466 0 0 0-.972.382c-.31.145-.535.284-.62.37a2.514 2.514 0 0 0-.267.35 8.576 8.576 0 0 0-.334.556c-.217.389-2.058 1.91-2.44 2.001-.299.072-.522.154-.586.2a1.741 1.741 0 0 0-.25.254c-.105.122-.22.272-.343.448a12.244 12.244 0 0 0-.617.974 1 1 0 0 1-1.361.383c-.662-.371.304-2.522.797-3.102.212-.248.41-.44.61-.583.312-.223.726-.384 1.28-.518.27-.065.563-.12.871-.166-.15.022-.172.044-.19.071.037-.054.085-.14.144-.254.024-.046.038-.076.077-.155l.134-.278c.054-.11.091-.185.127-.248.143-.258.281-.487.413-.687.18-.272.349-.488.517-.657.2-.202.879-.47 1.683-.714z"
                    fill="#FFF"
                    fillRule="nonzero"
                />
                <Path
                    d="M5.646 1.85a3.82 3.82 0 0 0-.455.58c-.127.192-.259.412-.394.654-.166.298-.486 1.09-.654 1.116-.281.041-.562.093-.827.157-.473.114-.846.252-1.107.438-.167.12-.339.288-.52.501C1.551 5.46.514 7.503.755 7.638a.5.5 0 0 0 .681-.191 12.763 12.763 0 0 1 .644-1.018c.13-.184.254-.348.37-.485a2.12 2.12 0 0 1 .34-.335c.13-.093.403-.194.76-.28.233-.056 1.966-1.479 2.121-1.759a9.07 9.07 0 0 1 .354-.588c.126-.19.238-.336.33-.427.136-.138.407-.303.762-.47a8.977 8.977 0 0 1 1.034-.406.5.5 0 0 0 .326-.628c-.083-.263-2.593.559-2.831.798z"
                    fill="#29568D"
                    fillRule="nonzero"
                />
            </G>
        </G>
    </Svg>
)

export default SvgGp
