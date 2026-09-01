import { biblicalIconMap } from '../../constants/biblicalIcons';
import { LuTag } from 'react-icons/lu';

export default function CategoryIcon({
  icon,
  color,
  size = 38,
  iconSize = 18,
  className = '',
  transparentBg = false
}) {
  const IconComponent = biblicalIconMap[icon] || LuTag;

  return (
    <div
      className={`category-icon-wrapper ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: transparentBg ? 'transparent' : color,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: transparentBg ? color : '#fff',
        flexShrink: 0
      }}
      aria-hidden="true"
    >
      <IconComponent size={iconSize} />
    </div>
  );
}
