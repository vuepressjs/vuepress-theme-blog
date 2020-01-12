const removeMd = require('remove-markdown')
const path = require('path')
const fs = require('fs-extra')

module.exports = (themeConfig, ctx) => {
  themeConfig = Object.assign(themeConfig, {
    nav: themeConfig.nav || [
      {
        text: 'Blog',
        link: '/',
      },
      {
        text: 'Tags',
        link: '/tag/',
      },
    ],
    summary: themeConfig.summary === undefined ? true : themeConfig.summary,
    summaryLength:
      typeof themeConfig.summaryLength === 'number'
        ? themeConfig.summaryLength
        : 200,
    pwa: !!themeConfig.pwa,
  })

  const defaultBlogPluginOptions = {
    directories: [
      {
        id: 'post',
        dirname: '_posts',
        path: '/',
        pagination: {
          lengthPerPage: 5,
        },
      },
    ],
    frontmatters: [
      {
        id: 'tag',
        keys: ['tag', 'tags'],
        path: '/tag/',
        pagination: {
          lengthPerPage: 5,
        },
      },
    ],
  }

  const { modifyBlogPluginOptions } = themeConfig

  const blogPluginOptions =
    typeof modifyBlogPluginOptions === 'function'
      ? modifyBlogPluginOptions(defaultBlogPluginOptions)
      : defaultBlogPluginOptions

  const plugins = [
    '@vuepress/plugin-nprogress',
    ['@vuepress/medium-zoom', true],
    [
      '@vuepress/search',
      {
        searchMaxSuggestions: 10,
      },
    ],
    ['@vuepress/blog', blogPluginOptions],
  ]

  if (themeConfig.pwa) {
    plugins.push([
      '@vuepress/pwa',
      {
        serviceWorker: true,
        updatePopup: true,
      },
    ])
  }

  const config = {
    plugins,
    define: {
      THEME_BLOG_PAGINATION_COMPONENT: themeConfig.paginationComponent
        ? themeConfig.paginationComponent
        : 'Pagination',
    },
    ready() {
      const dest = ctx.tempPath + '/fonts'
      copyFonts(dest)
    },
    generated() {
      const dest = ctx.outDir + '/fonts'
      copyFonts(dest)
    },
  }

  /**
   * Generate summary.
   */
  if (themeConfig.summary) {
    config.extendPageData = function(pageCtx) {
      const strippedContent = pageCtx._strippedContent
      if (!strippedContent) {
        return
      }
      pageCtx.summary =
        removeMd(
          strippedContent
            .trim()
            .replace(/^#+\s+(.*)/, '')
            .slice(0, themeConfig.summaryLength)
        ) + ' ...'
    }
  }

  return config
}

function copyFonts(dest) {
  const src = path.resolve(__dirname, 'fonts')
  fs.ensureDirSync(dest)
  fs.copySync(src, dest)
}
