var svgController = SVG('svg')

$(document).ready(function () {
  // fetch palette of example image
  fetchPalette()

  // handle drag & drop
  $dndEl = $('.image__dnd')
  $dndEl
    .on('dragenter', handleDragEnter)
    .on('dragleave', handleDragLeave)
    .on('dragover', handleDragOver)
    .on('drop', handleDrop)

  function handleDragEnter () { return false }

  function handleDragLeave () { return false }

  function handleDragOver () { return false }

  function handleDrop (event) {
    event.stopPropagation()
    event.preventDefault()
    handleFiles(event.originalEvent.dataTransfer.files)
    return false
  }

  // handle file browsing
  $chooseButtonEl = $('.dnd__button-choose')
  $fileInputEl    = $('.browse__control')

  $chooseButtonEl.on('click', function () {
    $fileInputEl.trigger('click')
  })

  $fileInputEl.on('input', function () {
    handleFiles(this.files)
  })

  // handle export
  $exportButtonEl = $('.result__export-button')
  $exportButtonEl.on('click', exportSVG)

  function exportSVG () {
    // console.log(svgController.svg().slice(0, -6))
    var content = `<?xml version="1.0" encoding="utf-8"?> ${svgController.svg()}`
    var element = document.createElement('a')
    element.setAttribute('href', 'data:text/xml;charset=utf-8,' + encodeURIComponent(content))
    element.setAttribute('download', `export_${moment().format('YYYYMMDDHHmmss')}.svg`)

    element.style.display = 'none'
    document.body.appendChild(element)

    element.click()

    document.body.removeChild(element)
  }
})

function handleFiles(files) {
  if (!files || files.length === 0 || !files[0]) {
    $('.debug').text('no files uploaded')
  }

  var reader = new FileReader()
  reader.onload = function (event) {
    $previewEl = $('.image__preview')
    $previewEl.attr('src', event.target.result)

    $previewEl.on('load', function () {
      fetchPalette()
    })
  }
  reader.readAsDataURL(files[0])
}

function fetchPalette () {
  $previewEl      = $('.image__preview')[0]
  $mainColorBoxEl = $('.main-color__color-box')
  $paletteListEl  = $('.palette__list')

  // clear current data
  $mainColorBoxEl.css('background-color', 'transparent')
  $paletteListEl.html('')

  var ct = new ColorThief()

  try {
    let mainColor = ct.getColor($previewEl)
    $mainColorBoxEl.css('background-color', `rgba(${mainColor.join(',')})`)

    let palette = ct.getPalette($previewEl)
    let paletteRgba = palette.map(color => `rgba(${color.join(',')})`)

    paletteRgba.forEach(color => {
      $paletteListEl.append(`
        <li>
          <div class="color-box" style="background-color: ${color}"></div>
        </li>
      `)
    })

    processTemplate(paletteRgba)
  } catch (err) {
    console.log(err)
    $('.debug').text(err)
  }

  function processTemplate (colors) {
    svgController.clear()

    $.ajax('img/template_polygon.svg')
      .done(data => {
        var rawSVG = new XMLSerializer().serializeToString(data.documentElement)

        svgController.svg(rawSVG)
        svgController.size(640, 720)

        svgController.select('path').members.forEach(path => {
          let color = colors[Math.floor(Math.random()*colors.length)]
          path.fill(color)
        })

        svgController.select('rect').members.forEach(rect => {
          let color = colors[Math.floor(Math.random()*colors.length)]
          rect.fill(color)
        })

        console.log(svgController)
      })
  }
}