const webPortfolio = class {
    constructor (options = {}) {
      this.container = options.containerId ? document.getElementById(options.containerId) : document.body
      this.sections = options.sectionClass ? document.getElementsByClassName(options.sectionClass) : document.getElementsByTagName('section')
      this.pageClass = options.pageClass ? options.pageClass : 'page'
      this.containerLinks = document.querySelector('.my-links');
  
      this.pagesPerSection = []
      this.currentPage = []
      this.currentSection = 0
      this.movelinks = false
  
      this.isDragging = false
      this.draggingPercent = 20
  
      this.waitAnimation = false
      this.timeToAnimate = 400
      
      this.height = 100
      this.width = 100
  
      this.swipeStartDirection = null
      this.swipeEndDirection = null
      
      this.options = {
        ...options
      }
      this.translate = {
        section: 0,
        page: []
      }
      
      this.touches = {
        startX: null,
        startY: null,
        endX: null,
        endY: null,
        differenceX: null,
        differenceY: null
      }
      
      this.init()
      this.setupEventListeners()
  
    }
  
    init () {
  
      const sectionButtonContainer = this.createElement('div', { className: 'sectionButtonContainer' }, this.container)
  
      const styleShapes = [`opacity: 0; transform: scale(0.1)`,`opacity: 1; transform: scale(1)`]
      const outShapes = ['.shape-one','.shape-two','.shape-one-top','.shape-one-bottom','.shape-two-bottom','.shape-two-bottom-min'];
      const initShapes = [[0,1,0,0,1,1],[0,0,1,1,1,1]]
  
      outShapes.forEach((shape, ix) => {
        let elShape = document.querySelector(shape + ` .blob-2`);
        elShape.innerHTML = this.getShapePath(styleShapes[initShapes[1][ix]],initShapes[0][ix])
      })
  
      const bubble = document.querySelectorAll(".shape-one .blob-2 path");
      const bubblered = document.querySelectorAll(".shape-two .blob-2 path");
  
      bubble.forEach( (el, ix) => {
        let time = 100;
        this.executeTransition(el, ix, time)    
      })  
  
      bubblered.forEach( (el, ix) => {
        let time = 100;
        this.executeTransition(el, ix, time)    
      })
  
      // Create elements for every section and apply styles
      for (let index = 0; index < this.sections.length; index++) {
  
        // Count and add page Starting position for every section
        this.translate.page[index] = 0
        this.currentPage[index] = 0
        this.pagesPerSection[index] = this.sections[index].getElementsByClassName(this.pageClass)
        
        // Apply background color for section
        if (this.options.colors) {
          this.sections[index].style.background = this.options.colors[index] ? this.options.colors[index] : 'white'
        }
        
        // We need to be sure that there is more then 1 section before creating navigation
        if (this.sections.length > 1) {
  
          // Create radio button for every section
          const sectionNavigationButton = this.createElement('input', {
            type: 'radio',
            name: 'sectionScrollButton',
            id: `sectionId[${index}]`,
            value: index,
            onclick: function (event) {
  
              if (this.waitAnimation) {
                return event.preventDefault()
              } else {
                this.switchAndTranslateSection(event) 
              }
  
            }.bind(this),
            checked: this.currentSection === index,
            style: {
              display: 'none'
            }
          }, sectionButtonContainer)
  
          // Give some custom style for radio buttons with labels
          this.createElement('label', { htmlFor: sectionNavigationButton.id }, sectionButtonContainer)
          
        }
  
        // Create navigation for pages only if there is more than 1 page per section
        if (this.pagesPerSection[index].length > 1) {
          
          const pageButtonContainer = this.createElement('div', { id: `pageButtonContainer[${index}]`, className: 'page_selection' }, this.sections[index])
  
          for (let i = 0; i < this.pagesPerSection[index].length; i++) {
  
            // Create radio button for every page
            this.createElement('input', {
              type: 'radio',
              id: `page[${index}][${i}]`,
              name: `pagination[${index}]`,
              value: i,
              checked: this.currentPage[i] === i,
              onclick: function (event) {
  
                if (this.waitAnimation) {
                  return event.preventDefault()
                } else {
                  this.switchAndTranslatePage(event) 
                }
              
              }.bind(this),
              style: {
                display: 'none'
              }
            }, pageButtonContainer)
  
            // Give some custom style for radio buttons with labels
            this.createElement('label', { htmlFor: `page[${index}][${i}]` }, pageButtonContainer)    
        
            this.pagesPerSection[index][i].style.transform = `translateX(-100%)`
          }
          // Align container to center
          pageButtonContainer.style.left = `calc(50% - ${pageButtonContainer.getBoundingClientRect().width / 2}px)`
        }
  
        this.currentPage[index]++
        this.translate.page[index] -= this.width
  
        this.sections[index].style.transform = `translateY(-100%)`
      }
      // Same thing as pageButtonContainer, but only with height 
      sectionButtonContainer.style.top = `calc(50% - ${sectionButtonContainer.getBoundingClientRect().height / 2}px)`
      
      this.currentSection++
      this.translate.section -= this.height
  
      setTimeout(() => {
        document.getElementById("_init_").remove();
      }, 1500)
  
    }
  
    getShapePath(style, ix) {
      const path_style = style;
      let path = [`
      <path d="M 392.8,547.7 C 427.8,592.2 497.3,600.5 536.4,565.8 561.4,545.7 595.7,539.8 618,516 635.7,498.1 638.6,470.8 637.7,445.6 636.8,425 636.9,404.2 640.7,384.2 645.7,352.9 651.8,320.4 642.8,288.1 629.8,234.1 578.5,188 524,187.1 490.6,186 460.7,202.9 437.5,224.4 411.5,245.9 384.3,266.1 355.4,283.4 329.4,301.4 305.1,326.1 299.7,359.5 294.8,392.4 309.6,425.9 328.3,453.7 348.9,485.7 371.1,516.5 392.8,547.7 Z" pathdata:id="M -907.7,1516 C -413.5,1881 567.9,1950 1120,1664 1473,1499 1957,1451 2272,1255 2522,1108 2563,884.2 2550,677.2 2538,508 2539,337.1 2593,172.8 2663,-84.28 2749,-351.2 2622,-616.5 2439,-1060 1714,-1439 944.9,-1446 473.3,-1455 51.08,-1316 -276.5,-1140 -643.6,-963.2 -1028,-797.3 -1436,-655.2 -1803,-507.3 -2146,-304.4 -2222,-30.07 -2291,240.2 -2082,515.3 -1818,743.7 -1528,1007 -1214,1260 -907.7,1516 Z" style="transform-origin: 579.018px 555.829px; ${path_style};"></path>
      <path d="M 340.9,428.6 C 353.4,444.4 366.9,459.6 379.5,475.4 403.4,504.3 427.7,533.6 456.8,557.3 489.9,575 531.5,568.6 556.1,543.8 577.6,531.8 603,522 614.9,498.7 630.2,460.2 616.4,415 630.3,376.1 638.9,344.4 645.6,309 632.7,275.9 618.1,227.4 561.8,193.1 515.5,207.3 484.3,217.6 466.6,247.4 441,265.8 407,291.9 363.4,305.4 336.1,339.9 317.5,364.6 321.9,402.7 340.9,428.6 Z" pathdata:id="M -1640,537.5 C -1464,667.3 -1273,792.2 -1095,921.9 -758,1159 -414.9,1400 -3.984,1595 463.4,1740 1051,1687 1398,1484 1702,1385 2060,1305 2228,1113 2444,797.1 2250,425.8 2446,106.3 2567,-154.1 2662,-444.9 2480,-716.8 2274,-1115 1479,-1397 824.9,-1280 384.3,-1196 134.4,-950.9 -227.1,-799.7 -707.2,-585.3 -1323,-474.4 -1708,-191.1 -1971,11.82 -1909,324.8 -1640,537.5 Z" style="transform-origin: 579.018px 555.829px; ${path_style};"></path>
      <path d="M 364,422.9 C 394.4,463.7 427.7,505 472.9,529.1 501.3,545.1 534.9,541.5 562.1,529.8 580.3,523.3 600.7,514.7 608,495.2 616.7,457.8 605,416.3 619.9,380.5 630.8,351 639.4,318.4 631.4,285.6 625.5,259.5 608.2,233.9 582.7,223.9 556.1,212.3 523.9,216.4 504.6,236.5 471.3,263.8 439.6,294.5 399.5,312 377.2,324.8 354.4,341.5 346.9,367.9 343.9,387.1 352.3,407.1 364,422.9 Z" pathdata:id="M -1314,490.7 C -885.1,825.8 -414.9,1165 223.3,1363 624.4,1494 1099,1465 1483,1369 1740,1315 2028,1245 2131,1085 2254,777.4 2089,436.5 2299,142.4 2453,-99.89 2574,-367.7 2461,-637.1 2378,-851.5 2134,-1062 1774,-1144 1398,-1239 943.5,-1205 671,-1040 200.8,-816.1 -246.8,-564 -813.1,-420.2 -1128,-315.1 -1450,-177.9 -1556,38.93 -1598,196.6 -1480,360.9 -1314,490.7 Z" style="transform-origin: 579.018px 555.829px; ${path_style};"></path>
      <path d="M 408.3,450.5 C 435.7,490.6 480.5,521.6 527.9,523.4 552.1,523.7 578.3,513.4 587.8,489.9 598.4,457.4 588.6,419.1 605.1,388.6 617,358.2 631.3,326.4 626.7,291.7 625.4,265.1 603.9,241.4 579.2,233.5 562.9,227.8 545.2,230.5 531.6,239.3 489.8,262.6 459.6,301.6 417.1,323.9 399.2,335.6 380.7,351.8 378.5,375.4 377.1,402.8 393.4,428 408.3,450.5 Z" pathdata:id="M -688.8,717.4 C -301.9,1047 330.7,1301 999.9,1316 1342,1319 1712,1234 1846,1041 1995,774.1 1857,459.5 2090,209 2258,-40.75 2460,-302 2395,-587 2377,-805.5 2073,-1000 1724,-1065 1494,-1112 1244,-1090 1052,-1017 462,-826 35.55,-505.7 -564.5,-322.5 -817.3,-226.4 -1079,-93.31 -1110,100.5 -1129,325.6 -899.2,532.6 -688.8,717.4 Z" style="transform-origin: 579.018px 555.829px; ${path_style};"></path>
      <path d="M 434.2,460.1 C 459.4,497.5 508.6,519.5 549.5,506.1 573.6,496.7 585.5,469.4 584.7,443.4 590.7,393.5 619.2,350 618.4,298.4 617.7,273.1 595.7,246.3 569.9,246.9 540.6,247.7 517.9,267.6 498.5,286.7 467.6,315.7 432.8,343.2 415.3,383.7 408.6,409.5 417.9,438.3 434.2,460.1 Z" pathdata:id="M -323.1,796.3 C 32.73,1103 727.4,1284 1305,1174 1645,1097 1813,872.7 1802,659.1 1887,249.2 2289,-108.1 2278,-531.9 2268,-739.8 1957,-959.9 1593,-955 1179,-948.4 858.7,-784.9 584.8,-628 148.5,-389.8 -342.9,-164 -590,168.7 -684.6,380.6 -553.3,617.2 -323.1,796.3 Z" style="transform-origin: 579.018px 555.829px; ${path_style};"></path>
      <path d="M 446,458.6 C 471.3,494.2 524.6,510.3 557.7,485.8 573.8,473.9 571.9,450.1 574.8,431.1 579.9,397.6 598.7,369.4 605.6,336.4 609.8,316.6 613,294.3 604.6,274.5 597.6,258 576.8,251.3 560.8,256.8 530.7,267.1 508.3,289.4 485.9,310.3 460.7,333.8 435.9,361.7 429.7,397.7 426.2,418.5 433.3,440.8 446,458.6 Z" pathdata:id="M -156.5,783.9 C 200.8,1076 953.4,1209 1421,1007 1648,909.6 1621,714.1 1662,558.1 1734,282.9 2000,51.25 2097,-219.8 2156,-382.4 2202,-565.6 2083,-728.3 1984,-863.8 1690,-918.8 1464,-873.6 1039,-789 723.2,-605.9 406.9,-434.2 51.08,-241.2 -299.1,-12 -386.6,283.7 -436.1,454.6 -335.8,637.7 -156.5,783.9 Z" style="transform-origin: 579.018px 555.829px; ${path_style};"></path>
      <path d="M 451.9,456.5 C 474.7,489.7 523.3,505.1 554.4,482.8 566.2,474.4 563.5,457 562.3,443.4 557.8,394.7 589.2,351.4 580.7,303.2 578.3,289.3 558.1,289.3 547.2,293.4 503.5,310 466,342.4 444.9,384.3 434,406 437,434.8 451.9,456.5 Z" pathdata:id="M -73.17,766.7 C 248.8,1039 935,1166 1374,982.7 1541,913.7 1503,770.8 1486,659.1 1422,259.1 1866,-96.6 1745,-492.5 1712,-606.7 1426,-606.7 1272,-573 655.4,-436.7 125.9,-170.5 -172,173.6 -325.9,351.9 -283.6,588.4 -73.17,766.7 Z" style="transform-origin: 579.018px 555.829px; ${path_style};"></path>`,
      `<path d="M 173.8,427.1 C 141.9,428.2 110,441.6 88.2,465.2 72.4,482.5 62.6,504.9 59.9,528 57.8,544.1 59,560.4 58.3,576.6 57.7,596.5 55.5,616.6 48.3,635.3 41,655.6 31.4,675.6 29.5,697.4 27.7,717.8 34.7,738.1 45.4,755.3 62.6,783.8 88.7,806.2 117.6,822.4 160.6,846.7 210.5,859.2 259.9,855.9 294.6,853.3 329.3,841.6 356.2,819.1 376.4,802.2 391.6,779.6 400,754.7 411.5,721.5 411.8,685.4 406.2,651 402.6,629.5 396.7,608.3 388.6,588.1 378.4,563.9 362.6,542.2 343,524.8 323.5,506.4 302.7,489.6 282.1,472.6 261.7,456.5 239.9,441 214.9,433 201.6,428.8 187.7,426.9 173.8,427.1 Z" pathdata:id="M 397.4,-2057 C 43.67,-2047 -310.1,-1933 -551.9,-1731 -727.1,-1583 -835.8,-1391 -865.7,-1193 -889,-1056 -875.7,-916.3 -883.5,-777.8 -890.1,-607.5 -914.5,-435.6 -994.4,-275.6 -1075,-102 -1182,69.08 -1203,255.6 -1223,430.1 -1145,603.7 -1027,750.8 -835.8,994.6 -546.3,1186 -225.8,1325 251.1,1533 804.4,1640 1352,1611 1737,1589 2122,1489 2420,1297 2644,1152 2813,958.7 2906,745.7 3034,461.7 3037,152.9 2975,-141.3 2935,-325.3 2869,-506.6 2780,-679.4 2666,-886.4 2491,-1072 2274,-1221 2058,-1378 1827,-1522 1598,-1667 1372,-1805 1130,-1938 853.2,-2006 705.7,-2042 551.6,-2058 397.4,-2057 Z" style="transform-origin: 279.018px 815.829px; ${path_style};"></path>
      <path d="M 270.9,500.2 C 211.4,463.7 131.3,458.8 96.6,505 67.9,535.1 76.8,555.9 71.2,597 66.7,628.3 39.6,694.8 49.6,728.3 64.9,771.1 104.8,807.1 147.6,827.2 220.4,861.9 308.1,851.5 351,799.8 382.5,762.5 388.1,708.4 375.3,657 362.7,604.3 333.3,550.6 287.7,511.6 282.5,507.3 276.4,503.7 270.9,500.2 Z" pathdata:id="M 1474,-1431 C 814.4,-1744 -73.88,-1785 -458.7,-1390 -777,-1133 -678.3,-954.8 -740.4,-603.3 -790.3,-335.5 -1091,233.3 -979.9,519.9 -810.3,886 -367.8,1194 106.9,1366 914.2,1663 1887,1574 2363,1131 2712,812.4 2774,349.7 2632,-90.02 2492,-540.8 2166,-1000 1661,-1334 1603,-1371 1535,-1401 1474,-1431 Z" style="transform-origin: 279.018px 815.829px; ${path_style};"></path>
      <path d="M 293.7,543 C 246.1,501.3 173.5,495.7 134.5,530.1 103.6,551.6 102,579 90.1,613.7 80.9,640.3 52.5,673.7 56.2,704.5 62.7,744.3 92.8,782.3 128.2,807 188.2,849.3 269.3,854.8 316.5,817 351.2,789.8 365.1,743.7 362.1,696.9 359.4,648.9 341.7,597.3 307.1,555.6 303,551.1 298.2,546.9 293.7,543 Z" pathdata:id="M 1727,-1065 C 1199,-1422 394.1,-1470 -38.39,-1176 -381.1,-991.6 -398.8,-757.2 -530.8,-460.4 -632.8,-232.9 -947.8,52.83 -906.7,316.3 -834.7,656.7 -500.8,981.8 -108.3,1193 557.1,1555 1457,1602 1980,1279 2365,1046 2519,651.6 2486,251.3 2456,-159.3 2259,-600.7 1876,-957.4 1830,-995.9 1777,-1032 1727,-1065 Z" style="transform-origin: 279.018px 815.829px; ${path_style};"></path>
      <path d="M 306.5,585.5 C 271.3,542.9 209.4,527.6 170.8,551.4 141,565.4 122.7,593.1 107.5,621.2 95.7,642.6 79.3,662.6 78,689.5 77.9,724.6 98.5,761.5 125.5,787.7 171.3,832.7 240.7,849.2 286.9,823.6 320.8,805.3 339.5,767.9 343.5,727.3 348.1,685.8 340.2,639 316.2,598.2 313.4,593.8 309.8,589.5 306.5,585.5 Z" pathdata:id="M 1869,-701.6 C 1479,-1066 792.2,-1197 364.2,-993.3 33.69,-873.6 -169.3,-636.6 -337.8,-396.3 -468.7,-213.2 -650.6,-42.12 -665,188 -666.1,488.2 -437.6,803.9 -138.2,1028 369.7,1413 1139,1554 1652,1335 2028,1179 2235,858.6 2279,511.3 2330,156.3 2243,-244 1977,-593 1946,-630.6 1906,-667.4 1869,-701.6 Z" style="transform-origin: 279.018px 815.829px; ${path_style};"></path>
      <path d="M 280.7,608.1 C 246.6,575.5 192.1,568.4 161.1,591.9 136.8,606.5 123.6,631.5 113.1,656.6 105,675.7 92.7,694 94,716.8 97.1,746.3 118.2,775.4 143.7,795 187.1,828.6 248.2,836 285.6,810.2 313,791.7 325.6,758.4 325.4,723.9 325.5,688.6 314.5,650 290.2,617.8 287.4,614.4 284,611.1 280.7,608.1 Z" pathdata:id="M 1583,-508.3 C 1205,-787.2 600.4,-847.9 256.6,-646.9 -12.89,-522 -159.3,-308.1 -275.7,-93.44 -365.5,69.94 -502,226.5 -487.5,421.5 -453.2,673.9 -219.2,922.8 63.63,1090 544.9,1378 1223,1441 1637,1220 1941,1062 2081,777.4 2079,482.2 2080,180.3 1958,-149.9 1688,-425.3 1657,-454.4 1620,-482.7 1583,-508.3 Z" style="transform-origin: 279.018px 815.829px; ${path_style};"></path>
      <path d="M 276,636.4 C 245.2,609.2 196.1,603.3 168.1,622.9 146.2,635.1 134.3,656 124.8,676.9 117.5,692.9 106.4,708.2 107.6,727.2 110.4,751.8 129.4,776.1 152.4,792.5 191.6,820.5 246.7,826.7 280.4,805.2 305.1,789.7 316.5,761.9 316.3,733.1 316.4,703.6 306.4,671.4 284.5,644.5 282,641.7 278.9,639 276,636.4 Z" pathdata:id="M 1531,-266.2 C 1189,-498.9 644.7,-549.4 334.2,-381.7 91.36,-277.4 -40.61,-98.58 -146,80.2 -226.9,217.1 -350,347.9 -336.7,510.5 -305.7,720.9 -94.95,928.8 160.1,1069 594.8,1309 1206,1362 1580,1178 1854,1045 1980,807.3 1978,560.9 1979,308.6 1868,33.16 1625,-196.9 1597,-220.9 1563,-244 1531,-266.2 Z" style="transform-origin: 279.018px 815.829px; ${path_style};"></path>
      <path d="M 257.2,650 C 230.7,627.8 188.4,623 164.2,639 145.4,648.9 135.1,666 127,683.1 120.6,696.1 111.1,708.6 112.1,724.2 114.5,744.2 130.9,764.1 150.8,777.5 184.5,800.4 232,805.4 261,787.9 282.4,775.2 292.2,752.5 292,729 292.1,704.9 283.5,678.6 264.6,656.6 262.4,654.3 259.8,652.1 257.2,650 Z" pathdata:id="M 1322,-149.9 C 1028,-339.8 559.4,-380.9 291,-244 82.49,-159.3 -31.74,-13.04 -121.6,133.2 -192.5,244.4 -297.9,351.4 -286.8,484.8 -260.2,655.9 -78.32,826.1 142.4,940.7 516.1,1137 1043,1179 1364,1030 1602,921.1 1710,726.9 1708,525.9 1709,319.7 1614,94.74 1404,-93.44 1380,-113.1 1351,-131.9 1322,-149.9 Z"style="transform-origin: 279.018px 815.829px; ${path_style};"></path>`];
  
      return path[ix];
    }
  
    executeTransition(el, ix, time){
      ix--
      setTimeout(() => {
        el.style.opacity = `1`
        el.style.transform = `scale(1)`
      }, time * ix)
    }
  
    switchAndTranslateSection (swipeOrClick) {
      // If we have no sections created or have to wait for animation to complete - return
      if (!this.sections || this.sections.length < 1 || this.waitAnimation) {
        return
      } else {
        this.waitAnimation = true
      }
  
      // Handle swipe or click for sections (UP/DOWN)
      if (((swipeOrClick.deltaY > 0 || swipeOrClick === 'down') && this.swipeStartDirection !== 'up') && (this.currentSection < this.sections.length - 1)) {
        this.currentSection++
        this.translate.section -= this.height
      } else
      if (((swipeOrClick.deltaY < 0 || swipeOrClick === 'up') && this.swipeStartDirection !== 'down') && (this.currentSection > 0)) {
        this.currentSection--
        this.translate.section += this.height
      } else  
      if (swipeOrClick.type === 'click') {
        const click = parseInt(swipeOrClick.target.value) - this.currentSection
        this.currentSection = parseInt(swipeOrClick.target.value)
        this.translate.section = this.translate.section - (this.height * click)
      } else {
        // Now, if there was any dragging, but canceled – animate back to origin.
        this.translate.section = Math.round(this.translate.section / 100) * 100
      }
  
      // This is needed to show active page on navigation buttons
      const button = document.getElementById(`sectionId[${this.currentSection}]`)
      if (button) {
        button.checked = true
      }
     
      // Reset settings after swipe, drag or click ended
      this.isDragging = false
      this.height = 100
      
      // Animate/translate sections
      for (let index = 0; index < this.sections.length; index++) {
        this.sections[index].style.transform = `translateY(${this.translate.section}%)`
      }
  
      // Complete previous animation before calling next
      setTimeout(() => {
        this.waitAnimation = false
      }, this.timeToAnimate)
  
  
      this.movelinks = (this.currentSection === 1 && this.currentPage[this.currentSection] === 1) ? true : false
      this.translateSectionLinks(this.movelinks)
    }
  
    translateSectionLinks(move) {
      if(move){
        this.containerLinks.classList.remove(`fixed-bubble`)
      }else{
        this.containerLinks.classList.add(`fixed-bubble`)
      }
    }
  
    switchAndTranslatePage (swipeOrClick) {
  
      if (!this.sections || this.sections.length < 1 || this.waitAnimation) {
        return
      } 
  
      // Handle swipe or click for pages (LEFT/RIGHT)
      if (swipeOrClick === 'right' && this.swipeStartDirection !== 'left' && (this.currentPage[this.currentSection] < this.pagesPerSection[this.currentSection].length - 1)) {
        this.currentPage[this.currentSection]++
        this.translate.page[this.currentSection] -= this.width
        for (let index = 0; index < this.translate.page.length; index++) {
          if(index!=this.currentSection){
            this.currentPage[index]++
            this.translate.page[index] -= this.width
          }
        }
      } else
      if (swipeOrClick === 'left' && this.swipeStartDirection !== 'right' && (this.currentPage[this.currentSection] > 0)) {
        this.currentPage[this.currentSection]--
        this.translate.page[this.currentSection] += this.width
        for (let index = 0; index < this.translate.page.length; index++) {
          if(index!=this.currentSection){
            this.currentPage[index]--
            this.translate.page[index] += this.width
          }
        }
      } else
      if (swipeOrClick.type === 'click') {
        console.log(this.currentPage)
        const getDirectionFromClick = parseInt(swipeOrClick.target.value) - this.currentPage[this.currentSection]
        this.currentPage[this.currentSection] = parseInt(swipeOrClick.target.value)
        this.translate.page[this.currentSection] = this.translate.page[this.currentSection] - (this.width * getDirectionFromClick)
        // console.log(swipeOrClick.target.value)
      } else {
        // Now, if there was any dragging, but canceled – animate back to origin.
        this.translate.page[this.currentSection] = Math.round(this.translate.page[this.currentSection] / 100) * 100
        for (let index = 0; index < this.translate.page.length; index++) {
          if(index!=this.currentSection){
            this.translate.page[index] = Math.round(this.translate.page[this.currentSection] / 100) * 100
          }
        }
      }
  
      // Reset settings after swipe, drag or click ended
      this.isDragging = false
      this.width = 100
      
      // This is needed to show active page on navigation buttons
      const button = document.getElementById(`page[${this.currentSection}][${this.currentPage[this.currentSection]}]`)
      if (button) {
        button.checked = true
      }
      
      // Animate/translate pages
      for (let index = 0; index < this.pagesPerSection[this.currentSection].length; index++) {
        this.pagesPerSection[this.currentSection][index].style.transform = `translateX(${this.translate.page[this.currentSection]}%)`
      }
  
      if((swipeOrClick === 'right' && this.swipeStartDirection === 'right') || (swipeOrClick === 'left' && this.swipeStartDirection === 'left')){
        let definedTransform;
        for (let index = 0; index < this.pagesPerSection.length; index++) {
          for (let ix = 0; ix < this.pagesPerSection[index].length; ix++) {
            let testDefinedTransform = this.pagesPerSection[this.currentSection][ix].style.transform;
            if(testDefinedTransform.length>0 ){
              definedTransform = testDefinedTransform
            }
          }
          for (let ix = 0; ix < this.pagesPerSection[index].length; ix++) {
  
            this.pagesPerSection[index][ix].style.transform = definedTransform
          }
          for (let ix = 0; ix < this.pagesPerSection[index].length; ix++) {
  
          }
        }
      }
  
      // Complete previous animation before calling next
      setTimeout(() => {
        this.waitAnimation = false
      }, this.timeToAnimate)
    }
  
    draggingEffect () {
      
      if (!this.isDragging) {
        return
      }
  
      // Save start swiping direction to compare when touch/click ended
      this.swipeStartDirection = this.swipeEndDirection
  
      // Check if dragging horizontal and we are not waiting for any previous animation to complete
      if ((this.swipeStartDirection === 'left' || this.swipeStartDirection === 'right') && !this.waitAnimation) {
  
        // Get all pages for current section
        const pages = this.pagesPerSection[this.currentSection]
  
        // Handle dragging effect
        if (this.swipeStartDirection === 'right') {
          this.width -= this.draggingPercent
          this.translate.page[this.currentSection] -= this.draggingPercent
        } else
        if (this.swipeStartDirection === 'left') {
          this.width -= this.draggingPercent
          this.translate.page[this.currentSection] += this.draggingPercent
        }
  
        // Animate horizontal drag effect
        for (let index = 0; index < pages.length; index++) {
          pages[index].style.transform = `translateX(${this.translate.page[this.currentSection]}%)`
          // console.log(pages[index]);
        }
      }
  
      // Check if dragging veritcal and we are not waiting for any previous animation to complete
      if ((this.swipeStartDirection === 'up' || this.swipeStartDirection === 'down') && !this.waitAnimation) {
       
        // Handle dragging effect
        if (this.swipeStartDirection === 'down') {
          this.height -= this.draggingPercent
          this.translate.section -= this.draggingPercent
        } else
        if (this.swipeStartDirection === 'up') {
          this.height -= this.draggingPercent
          this.translate.section += this.draggingPercent
        }
  
        // Animate vertical drag effect
        for (let index = 0; index < this.sections.length; index++) {
          this.sections[index].style.transform = `translateY(${this.translate.section}%)`
        }
      }
  
      // Function completed - we are not dragging anymore
      this.isDragging = false
    }
  
    // Check if it is Mobile or Desktop device
    getTouchOrClick (event) {
      const touch = event.touches ? event.touches[0] : event
      return touch
    }
  
    getDiffTranslate ( translate ){
      const mySubString = translate.substring(
        translate.lastIndexOf("(") + 1, 
        translate.lastIndexOf("%")
      ) * -1
      return mySubString
    }
  
    diffSubstractTranslate (prev, next) {
      const a = this.getDiffTranslate(prev);
      const b = this.getDiffTranslate(next);
      const diff = (a - b)
      return diff;
    }
  
    touchStart (event) {
      this.isDragging = true 
      this.touches.startX = this.getTouchOrClick(event).clientX
      this.touches.startY = this.getTouchOrClick(event).clientY
    }
  
    touchMove (event) {
      if (!this.touches.startX || !this.touches.startY) { 
        return
      }
  
      this.touches.endX = this.getTouchOrClick(event).clientX
      this.touches.endY = this.getTouchOrClick(event).clientY
  
      this.touches.differenceX = this.touches.startX - this.touches.endX
      this.touches.differenceY = this.touches.startY - this.touches.endY
  
      // We need to know vertical or horizontal swipe accured and then left/right or up/down
      if (Math.abs(this.touches.differenceX) > Math.abs(this.touches.differenceY)) {
        this.swipeEndDirection = this.touches.differenceX > 0 ? 'right' : 'left'
      } else {
        this.swipeEndDirection = this.touches.differenceY > 0 ? 'down' : 'up'
      }
  
      this.draggingEffect()
    }
  
    touchEnd () {
      if (this.swipeEndDirection) {   
        this.switchAndTranslatePage(this.swipeEndDirection)
        this.switchAndTranslateSection(this.swipeEndDirection)
      }
  
      this.isDragging = false
      this.touches.startX = null
      this.touches.startY = null
      this.swipeStartDirection = null
      this.swipeEndDirection = null
    }
  
    swipeWithKeyboard (event) {
  
      if (event.keyCode === 37 || event.code === 'ArrowLeft') {
        this.swipeEndDirection = 'left'
      } else
         
      if (event.keyCode === 38 || event.code === 'ArrowUp') {
        this.swipeEndDirection = 'up'
      } else
  
      if (event.keyCode === 39 || event.code === 'ArrowRight') {
        this.swipeEndDirection = 'right'
      } else 
  
      if (event.keyCode === 40 || event.code === 'ArrowDown') {
        this.swipeEndDirection = 'down'
      }
  
      // Check if any of allowed keys pressed only then execute function
      if (this.swipeEndDirection && !this.waitAnimation) {
        this.switchAndTranslatePage(this.swipeEndDirection)
        this.switchAndTranslateSection(this.swipeEndDirection)
      }
  
    }
    
    createElement (tag, options, parent) {
      try {
        const getParent = (typeof parent) === 'object' ? parent : document.getElementById(parent)
        const createElement = document.createElement(tag)
        
        for (const key in options) {
  
          if (key === 'style') {
  
            for (const style in options[key]) {
              createElement.style[style] = options[key][style]
            }
  
          } else if (key === 'onclick') {
           
            createElement.addEventListener('click', options[key])
            
          } else {
            createElement[key] = options[key]
          }
  
        }
        
        getParent.appendChild(createElement)
        return createElement
        
      } catch (error) {
        this.handleError('Unable to create buttons', error)
      }
    }
  
    setupEventListeners () {
      window.onwheel = this.switchAndTranslateSection.bind(this)
      window.onmousedown = this.touchStart.bind(this)
      window.onmousemove = this.touchMove.bind(this)
      window.onmouseup = this.touchEnd.bind(this)
      window.ontouchstart = this.touchStart.bind(this)
      window.ontouchmove = this.touchMove.bind(this)
      window.ontouchend = this.touchEnd.bind(this)
      window.onkeyup = this.swipeWithKeyboard.bind(this)
    }
  
    handleError (string, error) {
      console.warn(`${string}: `, error)
    }
  }
