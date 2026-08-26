import { biblicalIconMap } from '../../constants/biblicalIcons';
import { LuTag } from 'react-icons/lu';

export default function CategoryIcon({
  icon,
  color,
  size = 38,
  iconSize = 18,
  className = ''
}) {
  const IconComponent = biblicalIconMap[icon] || LuTag;

  return (
    <div
      className={`category-icon-wrapper ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        flexShrink: 0
      }}
      aria-hidden="true"
    >
      <IconComponent size={iconSize} />
    </div>
  );
}
