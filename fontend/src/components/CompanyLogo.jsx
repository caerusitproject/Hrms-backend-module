const CompanyLogo = ({ size = "md", className, priority = false }) => {
    const cn = (...classes) => classes.filter(Boolean).join(" ")
  
    const getSizeClasses = () => {
      if (typeof size === "number") {
        return {
          width: size,
          height: Math.round(size * (84 / 178)),
        }
      }
      const sizeMap = {
        sm: "w-20 h-[45px] md:w-24 md:h-[54px]",
        md: "w-32 h-[72px] md:w-40 md:h-[90px]",
        lg: "w-44 h-[99px] md:w-52 md:h-[117px]",
        xl: "w-56 h-[126px] md:w-64 md:h-[144px]",
      }
      return sizeMap[size]
    }
  
    const sizeClasses = getSizeClasses()
    const cacheBust = new Date().getTime();
  
    const handleImageLoad = () => console.log("Image loaded successfully");
    const handleImageError = (e) => {
      console.log("Image failed to load", e.target.src, e.target.error, e.nativeEvent);
      e.target.style.borderColor = 'yellow';
    };
  
    if (typeof size === "number") {
      return (
        <img
          src={`/images/caerus-logo.png`}
          alt="Caerus Consulting Logo"
          width={sizeClasses.width}
          height={sizeClasses.height}
          className={cn("object-contain", className)}
          style={{ objectFit: "contain", border: '2px solid red', position: 'relative', zIndex: 1 }}
          onLoad={handleImageLoad}
          onError={handleImageError}
          crossOrigin="anonymous" // Test CORS-related issues
        />
      )
    }
  
    return (
      <img
        src={`/images/caerus-logo.png`}
        alt="Caerus Consulting Logo"
        className={cn(sizeClasses, "object-contain", className)}
        style={{ objectFit: "contain", maxWidth: "100%", height: "auto", border: '2px solid red', position: 'relative', zIndex: 1 }}
        onLoad={handleImageLoad}
        onError={handleImageError}
        crossOrigin="anonymous" // Test CORS-related issues
      />
    )
  }
  
  export default CompanyLogo