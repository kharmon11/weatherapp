import pytest

from app.api.openweathermap import is_coordinates


@pytest.mark.parametrize(
    "location",
    [
        "40.7128,-74.0060",
        "0,0",
        "90,180",
        "-90,-180",
        " 40.7128 , -74.0060 ",
    ],
)
def test_valid_coordinates(location):
    assert is_coordinates(location) is True


@pytest.mark.parametrize(
    "location",
    [
        "90.0001,0",
        "-90.0001,0",
        "0,180.0001",
        "0,-180.0001",
    ],
)
def test_out_of_range_coordinates(location):
    assert is_coordinates(location) is False


@pytest.mark.parametrize(
    "location",
    [
        "New York, NY",
        "not,coordinates",
        "40.7128",
        "",
        "40.7128,-74.0060,extra",
    ],
)
def test_malformed_input(location):
    assert is_coordinates(location) is False


def test_non_string_input_returns_false():
    assert is_coordinates(None) is False
