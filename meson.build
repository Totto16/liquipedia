


project(
    'measure',
    'cpp',
    license: 'MIT',
    default_options: [
        'buildtype=release',
        'optimization=3',
        'cpp_std=c++20',
        'strip=true',
        'b_ndebug=if-release',
        'warning_level=3',
        'werror=true',
    ],
    version: '1.0.0',

)

cpp = meson.get_compiler('cpp')
if cpp.get_id() == 'msvc'
    add_project_arguments('/std:c++latest', language: 'cpp')
elif cpp.get_id() == 'gcc'
    add_project_arguments('-std=c++23', '-Wold-style-cast', language: 'cpp')
elif cpp.get_id() == 'clang'
    add_project_arguments('-std=c++2b', language: 'cpp')
else
    add_project_arguments('-std=c++20', language: 'cpp')
endif

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

