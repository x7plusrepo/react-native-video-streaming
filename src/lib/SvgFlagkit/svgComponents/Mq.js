import React from 'react'
import Svg, {Defs, G, LinearGradient, Path, Stop} from 'react-native-svg'

const SvgMq = props => (
    <Svg viewBox="0 0 21 15" width={21} height={15} {...props}>
        <Defs>
            <LinearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="MQ_svg__a">
                <Stop stopColor="#FFF" offset="0%" />
                <Stop stopColor="#F0F0F0" offset="100%" />
            </LinearGradient>
            <LinearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="MQ_svg__b">
                <Stop stopColor="#345CB3" offset="0%" />
                <Stop stopColor="#23448D" offset="100%" />
            </LinearGradient>
        </Defs>
        <G fill="none" fillRule="evenodd">
            <Path fill="url(#MQ_svg__a)" d="M0 0h21v15H0z" />
            <Path fill="url(#MQ_svg__b)" d="M0 0h21v15H0z" />
            <Path
                d="M15.917 1.603a4.37 4.37 0 0 1 .47.008c.207.015.352.061.341.018-.017-.067-.005-.084-.029-.067-.05.038.025-.007-.278.167-.442.253-.634.445-.537.791.085.304.31.387.839.47l.07.011c.211.033.306.053.369.081.014.006-.013-.037-.005-.064-.007.023-.148.078-.5.148l-.176.034c-.68.14-1.02.32-1.07.79-.055.516.479.875 1.15.963.685.09 1.28-.136 1.341-.692.039-.354-.207-.565-.596-.643-.264-.053-.611-.052-1.028-.011a11.378 11.378 0 0 0-1.386.235.25.25 0 1 0 .116.486 10.906 10.906 0 0 1 1.32-.223c.371-.037.675-.038.88.003.167.033.201.063.197.099-.02.19-.335.309-.779.25-.436-.057-.734-.257-.718-.413.017-.16.201-.257.673-.354l.172-.034c.582-.114.794-.198.883-.496.073-.244-.048-.436-.272-.535-.12-.053-.235-.078-.495-.118l-.069-.01c-.301-.048-.43-.096-.434-.112-.005-.015.068-.088.303-.222l.164-.094a1.87 1.87 0 0 0 .161-.103c.173-.126.269-.268.218-.463-.07-.273-.34-.357-.786-.39a4.847 4.847 0 0 0-.526-.01l-.075.003a.25.25 0 0 0 .029.5l.063-.003zM4.317 1.603a4.37 4.37 0 0 1 .47.008c.207.015.352.061.341.018-.017-.067-.005-.084-.029-.067-.05.038.025-.007-.278.167-.442.253-.634.445-.537.791.085.304.31.387.839.47l.07.011c.211.033.306.053.369.081.014.006-.013-.037-.005-.064-.007.023-.148.078-.5.148L4.88 3.2c-.68.14-1.02.32-1.07.79-.055.516.479.875 1.15.963.685.09 1.28-.136 1.341-.692.039-.354-.207-.565-.596-.643-.264-.053-.611-.052-1.028-.011a11.378 11.378 0 0 0-1.386.235.25.25 0 1 0 .116.486 10.906 10.906 0 0 1 1.32-.223c.371-.037.675-.038.88.003.167.033.201.063.197.099-.02.19-.335.309-.779.25-.436-.057-.734-.257-.718-.413.017-.16.201-.257.673-.354l.172-.034c.582-.114.794-.198.883-.496.073-.244-.048-.436-.272-.535-.12-.053-.235-.078-.495-.118l-.069-.01c-.301-.048-.43-.096-.434-.112-.005-.015.068-.088.303-.222l.164-.094a1.87 1.87 0 0 0 .161-.103c.173-.126.269-.268.218-.463-.07-.273-.34-.357-.786-.39a4.847 4.847 0 0 0-.526-.01l-.075.003a.25.25 0 0 0 .029.5l.063-.003zM15.917 10.603a4.37 4.37 0 0 1 .47.008c.207.015.352.061.341.018-.017-.067-.005-.084-.029-.067-.05.038.025-.007-.278.167-.442.253-.634.445-.537.791.085.304.31.387.839.47l.07.011c.211.033.306.053.369.081.014.006-.013-.037-.005-.064-.007.023-.148.078-.5.148l-.176.034c-.68.14-1.02.32-1.07.79-.055.516.479.875 1.15.963.685.09 1.28-.136 1.341-.692.039-.354-.207-.565-.596-.643-.264-.053-.611-.052-1.028-.011a11.378 11.378 0 0 0-1.386.235.25.25 0 0 0 .116.486 10.906 10.906 0 0 1 1.32-.223c.371-.037.675-.038.88.003.167.033.201.063.197.099-.02.19-.335.309-.779.25-.436-.057-.734-.257-.718-.413.017-.16.201-.257.673-.354l.172-.034c.582-.114.794-.198.883-.496.073-.244-.048-.436-.272-.535-.12-.053-.235-.078-.495-.118l-.069-.01c-.301-.048-.43-.096-.434-.112-.005-.015.068-.088.303-.222l.164-.094a1.87 1.87 0 0 0 .161-.103c.173-.126.269-.268.218-.463-.07-.273-.34-.357-.786-.39a4.847 4.847 0 0 0-.526-.01l-.075.003a.25.25 0 0 0 .029.5l.063-.003zM4.317 10.603a4.37 4.37 0 0 1 .47.008c.207.015.352.061.341.018-.017-.067-.005-.084-.029-.067-.05.038.025-.007-.278.167-.442.253-.634.445-.537.791.085.304.31.387.839.47l.07.011c.211.033.306.053.369.081.014.006-.013-.037-.005-.064-.007.023-.148.078-.5.148l-.176.034c-.68.14-1.02.32-1.07.79-.055.516.479.875 1.15.963.685.09 1.28-.136 1.341-.692.039-.354-.207-.565-.596-.643-.264-.053-.611-.052-1.028-.011a11.378 11.378 0 0 0-1.386.235.25.25 0 0 0 .116.486 10.906 10.906 0 0 1 1.32-.223c.371-.037.675-.038.88.003.167.033.201.063.197.099-.02.19-.335.309-.779.25-.436-.057-.734-.257-.718-.413.017-.16.201-.257.673-.354l.172-.034c.582-.114.794-.198.883-.496.073-.244-.048-.436-.272-.535-.12-.053-.235-.078-.495-.118l-.069-.01c-.301-.048-.43-.096-.434-.112-.005-.015.068-.088.303-.222l.164-.094a1.87 1.87 0 0 0 .161-.103c.173-.126.269-.268.218-.463-.07-.273-.34-.357-.786-.39a4.847 4.847 0 0 0-.526-.01l-.075.003a.25.25 0 0 0 .029.5l.063-.003z"
                fill="url(#MQ_svg__a)"
                fillRule="nonzero"
            />
            <Path d="M9 6H0v3h9v6h3V9h9V6h-9V0H9v6z" fill="url(#MQ_svg__a)" />
        </G>
    </Svg>
)

export default SvgMq
