


project(
    'measure',
    'cpp',
    license: 'MIT',
    default_options: [
        'buildtype=release',
        'optimization=3',
        'cpp_std=c++23',
        'strip=true',
        'b_ndebug=if-release',
        'warning_level=3',
        'werror=true',
    ],
    version: '1.0.0',

)

inc_dirs = []
src_files = []

subdir('src')

deps = []

omp_dep = dependency('openmp', required: true)
deps += omp_dep

executable(
    'combinatorics',
    src_files,
    include_directories: inc_dirs,
    dependencies: deps,
    c_args: '-DLIBRARY_VERSION=@0@'.format(meson.project_version()),
)

